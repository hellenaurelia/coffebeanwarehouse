"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp, Package, Clock } from "lucide-react";

const stats = [
  {
    label: "Transaksi Bulan Ini",
    value: "1.284",
    sub: "+12% dari bulan lalu",
    up: true,
    icon: Receipt,
  },
  {
    label: "Total Penjualan",
    value: "Rp 48.2jt",
    sub: "Akumulasi 30 hari",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Item Diproses",
    value: "3.712",
    sub: "Unit terjual",
    up: true,
    icon: Package,
  },
  {
    label: "Rata-rata Shift",
    value: "7.4 jam",
    sub: "Per hari kerja",
    up: null,
    icon: Clock,
  },
];

export function ActivityStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="font-display text-xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}