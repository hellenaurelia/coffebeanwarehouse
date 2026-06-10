import { Receipt, ArrowUpRight, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmt } from "../lib";
import type { Trx } from "../types";

interface StatsCardsProps {
  todayData: Trx[];
}

export function StatsCards({ todayData }: StatsCardsProps) {
  const stats = [
    {
      label: "Penjualan Hari Ini",
      value: fmt(todayData.reduce((a, b) => a + b.total, 0)),
      sub: `${todayData.length} transaksi`,
      icon: Receipt,
    },
    {
      label: "Rata-rata Basket",
      value: "Rp 226.000",
      sub: "+8% vs minggu lalu",
      icon: ArrowUpRight,
    },
    {
      label: "Metode Terpopuler",
      value: "QRIS",
      sub: "44% transaksi",
      icon: QrCode,
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