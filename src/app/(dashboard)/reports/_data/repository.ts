// Server-only analytics layer for Reports.
// Aggregates real transactions + stock into the DashboardData shape the UI
// already consumes, for the three preset ranges (7H / 30H / 90H).

import { prisma } from "@/lib/prisma";
import type { DashboardData, DataByRange, SalesData, StockStatus } from "../_components/types";

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function fmtShort(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function pct(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+100%" : "0%";
  const change = ((curr - prev) / prev) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(0)}%`;
}

function stockStatus(stok: number, minStock: number): StockStatus {
  if (stok < minStock) return "Kritis";
  if (stok < minStock * 2.4) return "Menipis";
  return "Aman";
}

// Build one range's DashboardData. `days` is the window length; `prevWindow`
// is the equally-sized window immediately before it (for trend %).
async function buildRange(label: string, days: number): Promise<DashboardData> {
  const now = new Date();
  const end = now;
  const start = startOfDay(new Date(now.getTime() - (days - 1) * 86_400_000));
  const prevStart = startOfDay(new Date(start.getTime() - days * 86_400_000));

  // ── Transactions in current + previous window ──────────────────────────
  const [currentTrx, prevTrx] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "PAID", paidAt: { gte: start, lte: end } },
      select: {
        totalAmount: true,
        paidAt: true,
        items: {
          select: {
            qtyKg: true,
            subtotal: true,
            product: { select: { name: true, sku: true } },
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { status: "PAID", paidAt: { gte: prevStart, lt: start } },
      select: { totalAmount: true },
    }),
  ]);

  // ── Sales series ───────────────────────────────────────────────────────
  // For 7H -> group by weekday label; for longer ranges -> group by date.
  const sales: SalesData[] = [];
  if (days <= 7) {
    const buckets = new Map<string, { penjualan: number; idx: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 86_400_000);
      const key = DAYS_ID[d.getDay()];
      buckets.set(key, { penjualan: 0, idx: i });
    }
    for (const t of currentTrx) {
      const d = t.paidAt ? new Date(t.paidAt) : null;
      if (!d) continue;
      const key = DAYS_ID[d.getDay()];
      const b = buckets.get(key);
      if (b) b.penjualan += t.totalAmount;
    }
    for (const [day, b] of [...buckets.entries()].sort((a, c) => a[1].idx - c[1].idx)) {
      sales.push({ day, penjualan: b.penjualan, pengeluaran: 0 });
    }
  } else {
    // Group into ~7 evenly spaced buckets for readability.
    const buckets = 7;
    const span = Math.ceil(days / buckets);
    for (let b = 0; b < buckets; b++) {
      const bStart = startOfDay(new Date(start.getTime() + b * span * 86_400_000));
      const bEnd = new Date(bStart.getTime() + span * 86_400_000);
      let penjualan = 0;
      for (const t of currentTrx) {
        const d = t.paidAt ? new Date(t.paidAt) : null;
        if (d && d >= bStart && d < bEnd) penjualan += t.totalAmount;
      }
      sales.push({ day: fmtShort(bStart), penjualan, pengeluaran: 0 });
    }
  }

  // ── Top products (by omzet) ──────────────────────────────────────────────
  const prodMap = new Map<string, { name: string; sku: string; terjual: number; kg: number; omzet: number }>();
  for (const t of currentTrx) {
    for (const it of t.items) {
      const key = it.product.sku;
      const cur = prodMap.get(key) ?? { name: it.product.name, sku: it.product.sku, terjual: 0, kg: 0, omzet: 0 };
      cur.terjual += 1;
      cur.kg += it.qtyKg;
      cur.omzet += it.subtotal;
      prodMap.set(key, cur);
    }
  }
  const topProducts = [...prodMap.values()]
    .sort((a, b) => b.omzet - a.omzet)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p, kg: Math.round(p.kg * 10) / 10 }));

  // ── Stock monitoring ─────────────────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, stockKg: true, minStockKg: true },
    orderBy: { stockKg: "asc" },
  });
  const stok = products.map((p) => ({
    name: p.name,
    stok: p.stockKg,
    // No capacity column in schema -> use a sensible cap (4x min, min 200kg).
    kapasitas: Math.max(p.minStockKg * 8, 200),
    status: stockStatus(p.stockKg, p.minStockKg),
  }));
  const kritisCount = stok.filter((s) => s.status === "Kritis").length;
  const totalStokKg = products.reduce((a, p) => a + p.stockKg, 0);

  // ── Expense breakdown ─────────────────────────────────────────────────────
  // Only purchasing is backed by data (received POs in window). Other
  // categories (operasional/gaji/logistik) have no source table -> 0.
  const receivedPOs = await prisma.purchaseOrder.findMany({
    where: { status: "DITERIMA", receivedAt: { gte: start, lte: end } },
    select: { totalAmount: true },
  });
  const pembelianBiji = receivedPOs.reduce((a, po) => a + po.totalAmount, 0);
  const expense = [
    { kategori: "Pembelian Biji", nominal: pembelianBiji },
    { kategori: "Operasional Gudang", nominal: 0 },
    { kategori: "Gaji Tim", nominal: 0 },
    { kategori: "Logistik & Kirim", nominal: 0 },
  ];

  // ── KPI trends ────────────────────────────────────────────────────────────
  const pendapatan = currentTrx.reduce((a, t) => a + t.totalAmount, 0);
  const prevPendapatan = prevTrx.reduce((a, t) => a + t.totalAmount, 0);
  const pengeluaran = pembelianBiji;

  return {
    label,
    sales,
    expense,
    topProducts,
    stok,
    pendapatanTrend: pct(pendapatan, prevPendapatan),
    pengeluaranTrend: "0%",
    stokKg: `${totalStokKg.toLocaleString("id-ID")} kg`,
    kritisCount,
    prevPendapatan,
    prevPengeluaran: 0,
  };
}

export async function getReportsData(): Promise<DataByRange> {
  const now = new Date();
  const label7 = `${fmtShort(new Date(now.getTime() - 6 * 86_400_000))} – ${fmtShort(now)}`;
  const [r7, r30, r90] = await Promise.all([
    buildRange(label7, 7),
    buildRange("30 Hari Terakhir", 30),
    buildRange("90 Hari Terakhir", 90),
  ]);
  return { "7H": r7, "30H": r30, "90H": r90 };
}
