"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp, Package, Clock, ArrowDownUp, BoxesIcon, AlertTriangle, RefreshCw } from "lucide-react";
import { useUser } from "../page"; 

const kasirStats = [
  {
    label: "Transaksi Bulan Ini",
    value: "1.284",
    sub: "+12% dari bulan lalu",
    icon: Receipt,
  },
  {
    label: "Total Penjualan",
    value: "Rp 48.2jt",
    sub: "Akumulasi 30 hari",
    icon: TrendingUp,
  },
  {
    label: "Item Diproses",
    value: "3.712",
    sub: "Unit terjual",
    icon: Package,
  },
  {
    label: "Rata-rata Shift",
    value: "7.4 jam",
    sub: "Per hari kerja",
    icon: Clock,
  },
];

const gudangStats = [
  {
    label: "Item Masuk Bulan Ini",
    value: "2.140",
    sub: "+8% dari bulan lalu",
    icon: ArrowDownUp,
  },
  {
    label: "Total Stok Aktif",
    value: "18.430",
    sub: "Unit tersedia",
    icon: BoxesIcon,
  },
  {
    label: "Stok Menipis",
    value: "7",
    sub: "Item perlu restock",
    icon: AlertTriangle,
  },
  {
    label: "Rekonsiliasi",
    value: "3x",
    sub: "Bulan ini",
    icon: RefreshCw,
  },
];

export function ActivityStats() {
  const { user } = useUser();

  // Owner dan manajer tidak menampilkan stats
  if (user.role === "owner" || user.role === "manajer") return null;

  const stats = user.role === "gudang" ? gudangStats : kasirStats;

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