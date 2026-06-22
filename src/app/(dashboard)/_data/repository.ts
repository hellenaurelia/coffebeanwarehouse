// Server-only read layer for the Dashboard home page.
// Aggregates real data into the exact shapes the existing JSX consumes.

import { prisma } from "@/lib/prisma";
import type { Supplier } from "@/app/(dashboard)/suppliers/lib";

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function rupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function rupiahShortK(n: number): string {
  // e.g. 280000 -> "Rp 280k"
  return `Rp ${Math.round(n / 1000)}k`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function pctDelta(curr: number, prev: number): { delta: string; up: boolean } {
  if (prev === 0) {
    return { delta: curr > 0 ? "+100%" : "0%", up: curr >= 0 };
  }
  const change = ((curr - prev) / prev) * 100;
  const up = change >= 0;
  return { delta: `${up ? "+" : ""}${change.toFixed(1)}%`, up };
}

function timeAgo(d: Date): string {
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

function fmtTanggal(d: Date): string {
  return `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtWaktu(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const METHOD_MAP: Record<string, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  CARD: "Kartu",
};

// ── Shapes consumed by the dashboard JSX (kept identical) ───────────────────
export type DashStat = {
  label: string;
  value: string;
  delta: string;
  up: boolean;
};

export type DashBean = {
  name: string;
  origin: string;
  stock: number;
  max: number;
  price: string;
  status: "Tersedia" | "Menipis" | "Kritis";
};

export type DashRecent = {
  id: string;
  item: string;
  displayTotal: string;
  timeAgo: string;
  method: string;
  date: string;
  time: string;
  cashier: string;
  total: number;
  cashPaid: number | null;
  detail: { name: string; qty: number; price: number }[];
};

export type DashboardData = {
  stats: DashStat[];
  beans: DashBean[];
  recent: DashRecent[];
  alert: { name: string; stock: number } | null;
  txCountToday: number;
  lowStockCount: number;
  suppliers: Supplier[];
};

function beanStatus(stock: number, minStock: number): DashBean["status"] {
  if (stock < minStock) return "Kritis";
  if (stock < minStock * 2.4) return "Menipis";
  return "Tersedia";
}

export async function getSuppliers(): Promise<Supplier[]> {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      supplierProducts: {
        where: {
          isActive: true,
        },
        include: {
          product: true,
        },
      },
    },
  });

  return suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    pic: s.picName,
    region: s.region,
    phone: s.phone,
    email: s.email ?? "",

    beans: s.supplierProducts.map((sp) => ({
      name: sp.product.name,
      price: sp.buyPricePerKg,
      type: sp.product.type,
      active: sp.isActive,
    })),

    lastDelivery: "-",
    totalKg: 0,

    status: s.isActive
      ? "Aktif"
      : "Non-aktif",

    address: s.address ?? undefined,
    notes: s.notes ?? undefined,
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(new Date(now.getTime() - 86_400_000));

  // ── KPI windows: today vs yesterday ───────────────────────────────────────
  const [todayTx, yesterdayTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { totalAmount: true, grossProfit: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
      select: { totalAmount: true, grossProfit: true },
    }),
  ]);

  const sumSales = (rows: typeof todayTx) =>
    rows.reduce((a, t) => a + t.totalAmount, 0);
  const sumProfit = (rows: typeof todayTx) =>
    rows.reduce((a, t) => a + (t.grossProfit ?? 0), 0);

  const salesToday = sumSales(todayTx);
  const salesYest = sumSales(yesterdayTx);
  const profitToday = sumProfit(todayTx);
  const profitYest = sumProfit(yesterdayTx);
  const txToday = todayTx.length;
  const txYest = yesterdayTx.length;
  const basketToday = txToday > 0 ? salesToday / txToday : 0;
  const basketYest = txYest > 0 ? salesYest / txYest : 0;

  const salesD = pctDelta(salesToday, salesYest);
  const profitD = pctDelta(profitToday, profitYest);
  const basketD = pctDelta(basketToday, basketYest);

  const stats: DashStat[] = [
    { label: "Penjualan Hari Ini", value: rupiah(salesToday), ...salesD },
    {
      label: "Transaksi",
      value: String(txToday),
      delta: `${txToday - txYest >= 0 ? "+" : ""}${txToday - txYest}`,
      up: txToday - txYest >= 0,
    },
    { label: "Profit Hari Ini", value: rupiah(profitToday), ...profitD },
    { label: "Avg. Basket", value: rupiah(basketToday), ...basketD },
  ];

  // ── Beans: top 5 by stock, with origin from linked supplier region ────────
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stockKg: "desc" },
    take: 5,
    select: {
      name: true,
      stockKg: true,
      minStockKg: true,
      sellPrice: true,
      supplierProducts: {
        where: { isActive: true },
        take: 1,
        select: { supplier: { select: { region: true } } },
      },
    },
  });

  const beans: DashBean[] = products.map((p) => ({
    name: p.name,
    origin: p.supplierProducts[0]?.supplier.region ?? "—",
    stock: p.stockKg,
    max: Math.max(p.minStockKg * 8, 200),
    price: rupiahShortK(p.sellPrice),
    status: beanStatus(p.stockKg, p.minStockKg),
  }));

  // ── Low-stock alert: the single most-critical product ─────────────────────
  const lowList = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stockKg: "asc" },
    select: { name: true, stockKg: true, minStockKg: true },
  });
  const lowStockCount = lowList.filter((p) => p.stockKg < p.minStockKg).length;
  const worst = lowList[0];
  const alert =
    worst && worst.stockKg < worst.minStockKg
      ? { name: worst.name, stock: worst.stockKg }
      : null;

  // ── Recent transactions (latest 5) ────────────────────────────────────────
  const recentRows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      trxNumber: true,
      paymentMethod: true,
      totalAmount: true,
      paidAt: true,
      createdAt: true,
      cashier: { select: { name: true } },
      items: {
        select: {
          qtyKg: true,
          sellPricePerKg: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  const recent: DashRecent[] = recentRows.map((t) => {
    const when = t.paidAt ?? t.createdAt;
    const itemLabel =
      t.items.length === 0
        ? "—"
        : t.items
            .map((it) =>
              it.qtyKg !== 1 ? `${it.product.name} x${it.qtyKg}` : it.product.name
            )
            .join(" · ");
    return {
      id: t.trxNumber,
      item: itemLabel,
      displayTotal: rupiah(t.totalAmount),
      timeAgo: timeAgo(when),
      method: METHOD_MAP[t.paymentMethod] ?? t.paymentMethod,
      date: fmtTanggal(when),
      time: fmtWaktu(when),
      cashier: t.cashier.name,
      total: t.totalAmount,
      cashPaid: null,
      detail: t.items.map((it) => ({
        name: it.product.name,
        qty: it.qtyKg,
        price: it.sellPricePerKg,
      })),
    };
  });

  // Suppliers for the "Place Purchase Order" modal.
  const suppliers = await getSuppliers();

  return {
    stats,
    beans,
    recent,
    alert,
    txCountToday: txToday,
    lowStockCount,
    suppliers,
  };
}