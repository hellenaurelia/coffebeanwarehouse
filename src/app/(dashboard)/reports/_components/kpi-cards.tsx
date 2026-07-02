"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  Receipt,
  Package,
  AlertTriangle,
  TrendingUp,
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

  // Hitung ulang trend dari nilai periode sebelumnya bila tersedia.
  // Menangani kasus pembanding = 0 (naik dari 0 => +100%, bukan 0%).
  function calcTrend(current: number, prev: number | undefined, fallback: string) {
    if (prev === undefined) return fallback;
    if (prev === 0) {
      if (current === 0) return "0%";
      return "+100%";
    }
    const pct = ((current - prev) / prev) * 100;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
  }

  const pendapatanTrend = calcTrend(totalPendapatan, data.prevPendapatan, data.pendapatanTrend);
  const pengeluaranTrend = calcTrend(totalPengeluaran, data.prevPengeluaran, data.pengeluaranTrend);

  // Arah pergerakan nilai (naik = panah atas).
  const pendapatanRose = pendapatanTrend.startsWith("+") && !pendapatanTrend.startsWith("+0%");
  const pengeluaranRose = pengeluaranTrend.startsWith("+") && !pengeluaranTrend.startsWith("+0%");

  const trendStats = [
    {
      label: "Pendapatan Kotor",
      value: fmt(totalPendapatan),
      delta: pendapatanTrend,
      rose: pendapatanRose,     // arah panah: naik?
      good: pendapatanRose,     // warna: pendapatan naik = baik (hijau)
      icon: Wallet,
      sub: data.prevPendapatan !== undefined ? `Sblm: ${fmt(data.prevPendapatan)}` : null,
    },
    {
      label: "Total Pengeluaran",
      value: fmt(totalPengeluaran),
      delta: pengeluaranTrend,
      rose: pengeluaranRose,    // arah panah: naik?
      good: !pengeluaranRose,   // warna: pengeluaran naik = buruk (merah)
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
            <div className={`mt-1 flex items-center gap-1 text-xs ${s.good ? "text-emerald-600" : "text-red-500"}`}>
              {s.rose ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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