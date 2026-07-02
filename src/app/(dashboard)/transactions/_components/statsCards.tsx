import { Receipt, ArrowUpRight, QrCode, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmt } from "../lib";
import type { Method, Trx } from "../types";

interface StatsCardsProps {
  todayData: Trx[];
}

const methodIconMap = {
  Cash: Wallet,
  Kartu: CreditCard,
  QRIS: QrCode,
} as const;

export function StatsCards({ todayData }: StatsCardsProps) {
  const count = todayData.length;
  const totalSales = todayData.reduce((a, b) => a + b.total, 0);

  // Rata-rata basket = total penjualan / jumlah transaksi
  const avgBasket = count > 0 ? totalSales / count : 0;

  // Metode terpopuler = metode dengan transaksi terbanyak
  const methodCounts = todayData.reduce<Record<string, number>>((acc, t) => {
    acc[t.method] = (acc[t.method] ?? 0) + 1;
    return acc;
  }, {});

  let topMethod: Method | "—" = "—";
  let topMethodCount = 0;
  for (const [m, c] of Object.entries(methodCounts)) {
    if (c > topMethodCount) {
      topMethod = m as Method;
      topMethodCount = c;
    }
  }
  const topMethodPct = count > 0 ? Math.round((topMethodCount / count) * 100) : 0;

  const stats = [
    {
      label: "Penjualan Hari Ini",
      value: fmt(totalSales),
      sub: `${count} transaksi`,
      icon: Receipt,
    },
    {
      label: "Rata-rata Basket",
      value: fmt(avgBasket),
      sub: count > 0 ? `dari ${count} transaksi` : "belum ada transaksi",
      icon: ArrowUpRight,
    },
    {
      label: "Metode Terpopuler",
      value: topMethod,
      sub: count > 0 ? `${topMethodPct}% transaksi` : "belum ada transaksi",
      icon: topMethod !== "—" ? methodIconMap[topMethod] : QrCode,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(s => (
        <Card key={s.label} className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}