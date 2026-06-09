"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight, ArrowDownRight, Coffee, Package, Receipt, TrendingUp,
  AlertTriangle, ScanBarcode,
  ShoppingBasket
} from "lucide-react";

const stats = [
  { label: "Penjualan Hari Ini", value: "Rp 12.480.000", delta: "+18.2%", up: true, icon: Receipt },
  { label: "Transaksi", value: "184", delta: "-12", up: false, icon: ScanBarcode },
  { label: "Profit Hari Ini", value: "Rp 2.480.000", delta: "+18.2%", up: true, icon: TrendingUp },
  { label: "Avg. Basket", value: "Rp 67.800", delta: "+4.1%", up: true, icon: ShoppingBasket },
];

const beans = [
  { name: "Gayo Wine Natural", origin: "Aceh, Indonesia", stock: 142, max: 250, price: "Rp 280k", status: "Tersedia" },
  { name: "Kintamani Honey", origin: "Bali, Indonesia", stock: 38, max: 200, price: "Rp 240k", status: "Menipis" },
  { name: "Toraja Sapan", origin: "Sulawesi, Indonesia", stock: 96, max: 180, price: "Rp 310k", status: "Tersedia" },
  { name: "Ethiopia Yirgacheffe", origin: "Yirgacheffe, ET", stock: 12, max: 120, price: "Rp 420k", status: "Kritis" },
  { name: "Java Preanger", origin: "Jawa Barat, ID", stock: 168, max: 220, price: "Rp 220k", status: "Tersedia" },
];

const recent = [
  { id: "TRX-2049", item: "Gayo Wine 250g · Espresso x2", total: "Rp 184.000", time: "2 menit lalu", method: "QRIS" },
  { id: "TRX-2048", item: "Kintamani 1kg", total: "Rp 240.000", time: "8 menit lalu", method: "Cash" },
  { id: "TRX-2047", item: "Toraja 500g · V60 x1", total: "Rp 198.000", time: "14 menit lalu", method: "Debit" },
  { id: "TRX-2046", item: "Ethiopia 200g", total: "Rp 92.000", time: "21 menit lalu", method: "QRIS" },
  { id: "TRX-2045", item: "Java Preanger 1kg", total: "Rp 220.000", time: "28 menit lalu", method: "Credit" },
];

const formattedDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})
  .format(new Date())
  .replace(",", " ·");

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Ringkasan operasional toko biji kopi hari ini" />
      <main className="flex-1 p-6 space-y-6">
        {/* Hero */}
        <Card className="overflow-hidden border-0 shadow-warm">
          <div className="relative gradient-bean p-8 text-primary-foreground">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <Badge className="bg-primary-foreground/15 text-primary-foreground border-0 backdrop-blur">
                  {formattedDate}
                </Badge>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-balance">
                  Selamat pagi, Arif. 

                </h2>
                <p className="text-primary-foreground/75 text-sm">
                  24 transaksi hari ini · 1 stok perlu restock.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link href="/inventory"><Package className="mr-2 h-4 w-4" />Lihat Inventory</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/transactions"><Receipt className="mr-2 h-4 w-4" />Lihat Transaksi</Link>
                </Button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-crema/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className={`mt-1 flex items-center gap-1 text-xs ${s.up ? "text-emerald-600" : "text-red-600"}`}>
                  {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.delta} <span className="text-muted-foreground">vs kemarin</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inventory */}
          <Card className="lg:col-span-2 shadow-soft border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="font-display">Top 5 Biji Kopi</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Posisi gudang utama · diperbarui 5 menit lalu</p>
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-accent hover:text-primary-foreground">
                  Kelola →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {beans.map((b) => {
                const pct = Math.round((b.stock / b.max) * 100);
                const tone =
                  b.status === "Kritis" ? "bg-red-500/10 text-red-700 border-red-500/20"
                  : b.status === "Menipis" ? "bg-crema/30 text-roast border-crema/40"
                  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
                return (
                  <div key={b.name} className="rounded-xl border border-border/60 p-4 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg gradient-bean flex items-center justify-center shrink-0">
                          <Coffee className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.origin}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium tabular-nums">{b.price}<span className="text-muted-foreground font-normal">/kg</span></span>
                        <Badge variant="outline" className={tone}>{b.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground tabular-nums w-20 text-right">{b.stock}/{b.max} kg</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Side column */}
          <div className="space-y-6">
            <Card className="shadow-soft border-border/60 bg-primary">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary-foreground">Perlu Tindakan</span>
                </div>
                <p className="mt-3 text-sm text-primary-foreground">
                  <strong>Ethiopia Yirgacheffe</strong> tersisa 12 kg. Estimasi habis dalam 2 hari.
                </p>
                <Button size="sm" className="mt-4 w-full bg-crema/40 text-primary-foreground hover:bg-crema/30">
                  Place Purchase Order
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display">Transaksi Terakhir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                      <div className="text-sm font-medium truncate">{t.item}</div>
                      <div className="text-xs text-muted-foreground">{t.time} · {t.method}</div>
                    </div>
                    <span className="font-medium tabular-nums text-sm">{t.total}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </>
  );
}
