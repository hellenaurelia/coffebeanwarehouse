"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Package,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  AlertTriangle,
} from "lucide-react";

const salesSeries = [
  { day: "Sen", penjualan: 4_120_000, pengeluaran: 1_350_000 },
  { day: "Sel", penjualan: 3_680_000, pengeluaran: 980_000 },
  { day: "Rab", penjualan: 5_240_000, pengeluaran: 2_100_000 },
  { day: "Kam", penjualan: 4_780_000, pengeluaran: 1_420_000 },
  { day: "Jum", penjualan: 6_310_000, pengeluaran: 1_750_000 },
  { day: "Sab", penjualan: 7_890_000, pengeluaran: 2_240_000 },
  { day: "Min", penjualan: 6_540_000, pengeluaran: 1_180_000 },
];

const topProducts = [
  { rank: 1, name: "Arabica Gayo Wine", sku: "ARB-GYW-250", terjual: 142, kg: 35.5, omzet: 17_750_000 },
  { rank: 2, name: "Robusta Lampung AP-1", sku: "ROB-LPG-500", terjual: 128, kg: 64, omzet: 11_520_000 },
  { rank: 3, name: "Arabica Toraja Sapan", sku: "ARB-TRJ-250", terjual: 96, kg: 24, omzet: 14_400_000 },
  { rank: 4, name: "Luwak Liar Bali Kintamani", sku: "LWK-BLI-100", terjual: 54, kg: 5.4, omzet: 21_600_000 },
  { rank: 5, name: "Liberica Jambi Tungkal", sku: "LBR-JMB-250", terjual: 47, kg: 11.75, omzet: 5_405_000 },
];

const expense = [
  { kategori: "Pembelian Biji", nominal: 6_840_000 },
  { kategori: "Operasional Gudang", nominal: 2_120_000 },
  { kategori: "Gaji Tim", nominal: 1_580_000 },
  { kategori: "Logistik & Kirim", nominal: 480_000 },
];

const stokGudang = [
  { name: "Arabica Gayo Wine", stok: 38, kapasitas: 80, status: "Aman" as const },
  { name: "Robusta Lampung AP-1", stok: 124, kapasitas: 200, status: "Aman" as const },
  { name: "Arabica Toraja Sapan", stok: 22, kapasitas: 80, status: "Menipis" as const },
  { name: "Luwak Liar Bali Kintamani", stok: 4, kapasitas: 20, status: "Kritis" as const },
  { name: "Liberica Jambi Tungkal", stok: 61, kapasitas: 120, status: "Aman" as const },
];

const statusTone = (s: "Aman" | "Menipis" | "Kritis") =>
  s === "Aman"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : s === "Menipis"
      ? "bg-crema/50 text-roast border-crema/60"
      : "bg-destructive/10 text-destructive border-destructive/30";

const chartConfig = {
  penjualan: { label: "Penjualan", color: "hsl(var(--primary))" },
  pengeluaran: { label: "Pengeluaran", color: "hsl(var(--accent))" },
} as const;

export default function ReportsPage() {
  const [range, setRange] = useState<"7H" | "30H" | "90H">("7H");
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const fmtK = (n: number) => "Rp " + (n / 1_000_000).toFixed(1) + " Jt";

  const totalPenjualan = salesSeries.reduce((a, b) => a + b.penjualan, 0);
  const totalPengeluaran = expense.reduce((a, b) => a + b.nominal, 0);
  const labaBersih = totalPenjualan - totalPengeluaran;
  const margin = ((labaBersih / totalPenjualan) * 100).toFixed(1);

  return (
    <>
      <Topbar title="Laporan" subtitle="Ringkasan performa bisnis & gudang" />
      <main className="flex-1 p-6 space-y-6">
        {/* Header / Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 p-1">
            {(["7H", "30H", "90H"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r ? "default" : "ghost"}
                className="h-8 rounded-full px-4 text-xs"
                onClick={() => setRange(r)}
              >
                {r === "7H" ? "7 Hari" : r === "30H" ? "30 Hari" : "90 Hari"}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Calendar className="mr-2 h-4 w-4" /> 3 - 9 Mei 2026
            </Button>
            <Button size="sm" className="rounded-full">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Pendapatan</span>
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(totalPenjualan)}</p>
              <p className="mt-1 inline-flex items-center text-xs text-emerald-700">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +12,4% vs minggu lalu
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Pengeluaran</span>
                <Wallet className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(totalPengeluaran)}</p>
              <p className="mt-1 inline-flex items-center text-xs text-destructive">
                <ArrowDownRight className="mr-1 h-3 w-3" /> +4,1% vs minggu lalu
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Laba Bersih</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(labaBersih)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Margin {margin}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Stok Gudang</span>
                <Package className="h-4 w-4 text-bean" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">249 kg</p>
              <p className="mt-1 inline-flex items-center text-xs text-roast">
                <AlertTriangle className="mr-1 h-3 w-3" /> 2 item perlu re-order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales chart + Expense breakdown */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 bg-card shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-lg">Grafik Penjualan</CardTitle>
                <p className="text-xs text-muted-foreground">Perbandingan pendapatan & pengeluaran harian</p>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary">
                <TrendingUp className="mr-1 h-3 w-3" /> Tren naik
              </Badge>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <AreaChart data={salesSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPenjualan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-bean)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--color-bean)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPengeluaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-roast)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-roast)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickFormatter={(v) => `${v / 1_000_000}Jt`} tickLine={false} axisLine={false} className="text-xs" width={40} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="capitalize text-muted-foreground">{name}</span>
                              <span className="font-mono font-medium">{fmtK(Number(value))}</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Area type="monotone" dataKey="penjualan" stroke="var(--color-bean)" strokeWidth={2.5} fill="url(#gPenjualan)" />
                    <Area type="monotone" dataKey="pengeluaran" stroke="var(--color-roast)" strokeWidth={2} fill="url(#gPengeluaran)" />
                  </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-warm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Rincian Pengeluaran</CardTitle>
              <p className="text-xs text-muted-foreground">Pekan ini · {fmt(totalPengeluaran)}</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={expense} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="kategori"
                      tickLine={false}
                      axisLine={false}
                      width={120}
                      className="text-xs"
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono font-medium">{fmt(Number(value))}</span>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="nominal" fill="var(--color-bean)" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
              </ChartContainer>
              <div className="mt-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
                Pembelian biji menyumbang <span className="font-semibold text-foreground">62%</span> dari total pengeluaran pekan ini.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top products + Stock monitoring */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3 border-border/60 bg-card shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-lg">Top 5 Barang Terlaris</CardTitle>
                <p className="text-xs text-muted-foreground">Berdasarkan jumlah transaksi pekan ini</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Lihat semua <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {topProducts.map((p) => (
                  <div key={p.sku} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-crema font-display text-sm font-semibold text-primary-foreground shadow-warm">
                      {p.rank}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
                      <Coffee className="h-4 w-4 text-bean" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · {p.kg} kg terjual</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-foreground">{fmt(p.omzet)}</p>
                      <p className="text-xs text-muted-foreground">{p.terjual} transaksi</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/60 bg-card shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-lg">Monitoring Stok Gudang</CardTitle>
                <p className="text-xs text-muted-foreground">Level kapasitas per varian</p>
              </div>
              <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/5 text-destructive">
                <TrendingDown className="mr-1 h-3 w-3" /> 2 kritis
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {stokGudang.map((s) => {
                const pct = Math.round((s.stok / s.kapasitas) * 100);
                return (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                      <Badge variant="outline" className={`rounded-full text-[10px] ${statusTone(s.status)}`}>
                        {s.status}
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-2 bg-secondary" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{s.stok} kg / {s.kapasitas} kg</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}