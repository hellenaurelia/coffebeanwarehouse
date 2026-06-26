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
  id: string;
  sku: string;
  name: string;
  type: string;
  origin: string;
  stock: number;
  unit: string;
  max: number;
  cost: number;
  price: string;
  priceNum: number;
  supplier: string;
  status: "Tersedia" | "Menipis" | "Kritis";
  trxCount: number;
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
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      supplierProducts: {
        where: { isActive: true },
        include: { product: true },
      },
    },
  });

  return suppliers.map((s) => ({
    id: s.id,
    code: s.supplierCode,
    name: s.name,
    pic: s.picName,
    region: s.region,
    phone: s.phone,
    email: s.email ?? "",

    beans: s.supplierProducts.map((sp) => ({
      name: sp.product.name,
      price: sp.buyPricePerKg,
      type: sp.product.variety ?? "",
      active: sp.isActive,
    })),

    lastDelivery: "-",
    totalKg: 0,

    status: s.isActive ? "Aktif" : "Non-aktif",

    address: s.address ?? undefined,
    notes: s.notes ?? undefined,
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(new Date(now.getTime() - 86_400_000));

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

  // Top 5 biji kopi paling sering dibeli (frekuensi transaksi, 30 hari).
  const since30 = startOfDay(new Date(now.getTime() - 30 * 86_400_000));

  const topFreq = await prisma.$queryRaw<
    { product_id: string; trx_count: bigint }[]
  >`
    SELECT ti.product_id, COUNT(DISTINCT ti.transaction_id) AS trx_count
    FROM transaction_items ti
    JOIN transactions t ON t.id = ti.transaction_id
    WHERE t.status = 'PAID'
      AND t.created_at >= ${since30}
    GROUP BY ti.product_id
    ORDER BY trx_count DESC
    LIMIT 5
  `;

  const topIds = topFreq.map((r) => r.product_id);
  const freqById = new Map(topIds.map((id, i) => [id, Number(topFreq[i].trx_count)]));

  const topProducts =
    topIds.length === 0
      ? []
      : await prisma.product.findMany({
          where: { id: { in: topIds } },
          select: {
            id: true,
            sku: true,
            name: true,
            variety: true,
            stockKg: true,
            minStockKg: true,
            sellPrice: true,
            supplierProducts: {
              where: { isActive: true, supplier: { isActive: true, deletedAt: null } },
              take: 1,
              select: {
                buyPricePerKg: true,
                supplier: { select: { name: true, region: true } },
              },
            },
          },
        });

  const productById = new Map(topProducts.map((p) => [p.id, p]));
  const beans: DashBean[] = topIds
    .map((id) => {
      const p = productById.get(id);
      if (!p) return null;
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        type: p.variety ?? "",
        origin: p.supplierProducts[0]?.supplier.region ?? "—",
        stock: p.stockKg,
        unit: "kg",
        max: Math.max(p.minStockKg * 8, 200),
        cost: p.supplierProducts[0]?.buyPricePerKg ?? 0,
        price: rupiahShortK(p.sellPrice),
        priceNum: p.sellPrice,
        supplier: p.supplierProducts[0]?.supplier.name ?? "-",
        status: beanStatus(p.stockKg, p.minStockKg),
        trxCount: freqById.get(id) ?? 0,
      } satisfies DashBean;
    })
    .filter((b): b is DashBean => b !== null);

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