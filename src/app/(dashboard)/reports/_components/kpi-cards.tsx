"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  Receipt,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowDownRight,
  TrendingDown,
} from "lucide-react";
import { fmt } from "./utils";
import { DashboardData } from "./types";

interface KPICardProps {
  data: DashboardData;
}

export function KPICards({ data }: KPICardProps) {
  const totalPendapatan = data.sales.reduce((sum, s) => sum + s.penjualan, 0);
  const totalPengeluaran = data.expense.reduce((sum, e) => sum + e.nominal, 0);

  const isPendapatanUp = data.pendapatanTrend.startsWith("+");
  const isPengeluaranUp = data.pengeluaranTrend.startsWith("+");

  const trendStats = [
    {
      label: "Pendapatan Kotor",
      value: fmt(totalPendapatan),
      delta: data.pendapatanTrend,
      up: isPendapatanUp,
      icon: Wallet,
      sub: data.prevPendapatan !== undefined ? `Sblm: ${fmt(data.prevPendapatan)}` : null,
    },
    {
      label: "Total Pengeluaran",
      value: fmt(totalPengeluaran),
      delta: data.pengeluaranTrend,
      up: !isPengeluaranUp,
      icon: Receipt,
      sub: data.prevPengeluaran !== undefined ? `Sblm: ${fmt(data.prevPengeluaran)}` : null,
    },
  ];

  const infoStats = [
    {
      label: "Stok Gudang",
      value: data.stokKg,
      info: `${data.stok.length} varian tersimpan`,
      icon: Package,
    },
    {
      label: "Item Kritis",
      value: `${data.kritisCount} item`,
      info: "perlu re-order segera",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {trendStats.map((s) => (
        <Card key={s.label} className="shadow-warm border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
            {s.sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>}
            <div className={`mt-1 flex items-center gap-1 text-xs ${s.up ? "text-emerald-600" : "text-red-500"}`}>
              {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {s.delta}
              <span className="text-muted-foreground">vs periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {infoStats.map((s) => (
        <Card key={s.label} className="shadow-warm border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{s.info}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}