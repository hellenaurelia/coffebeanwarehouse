"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Greeting from "@/components/ui/greetings";
import { Progress } from "@/components/ui/progress";
import {
  Coffee, Package, Receipt, TrendingUp, TrendingDown, AlertTriangle, ScanBarcode, ShoppingBasket
} from "lucide-react";

import { DetailModal } from "@/app/(dashboard)/transactions/_components/detailModal";
import { BuatPOModal } from "@/app/(dashboard)/suppliers/_components/make-po-modal";
import { savePOAction } from "@/app/(dashboard)/suppliers/_data/actions";
import type { Supplier, PO } from "@/app/(dashboard)/suppliers/lib";
import type { DashboardData } from "@/app/(dashboard)/_data/repository";

const STAT_ICON: Record<string, typeof Receipt> = {
  "Penjualan Hari Ini": Receipt,
  "Transaksi": ScanBarcode,
  "Profit Hari Ini": TrendingUp,
  "Avg. Basket": ShoppingBasket,
};

const formattedDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date()).replace(",", " ·");

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { stats, beans, recent, alert, txCountToday, lowStockCount, suppliers } = data;

  const [showPO, setShowPO] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);

  const handleSavePO = async (po: Omit<PO, "id">) => {
    try {
      await savePOAction(po);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Gagal menyimpan PO.");
    }
  };

  return (
    <>
      <Topbar title="Dashboard" subtitle="Ringkasan operasional Arunika hari ini" />
      <main className="flex-1 p-6 space-y-6 relative">
        {/* Hero */}
        <Card className="overflow-hidden border-0 shadow-warm">
          <div className="relative gradient-bean p-8 text-primary-foreground">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <Badge className="bg-primary-foreground/15 text-primary-foreground border-0 backdrop-blur">
                  {formattedDate}
                </Badge>
                <Greeting />
                <p className="text-primary-foreground/75 text-sm">
                  {txCountToday} transaksi hari ini · {lowStockCount} stok perlu restock.
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
          {stats.map((s) => {
            const Icon = STAT_ICON[s.label] ?? Receipt;
            return (
              <Card key={s.label} className="shadow-soft border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                  <div className={`mt-1 flex items-center gap-1 text-xs ${s.up ? "text-emerald-600" : "text-red-600"}`}>
                    {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {s.delta} <span className="text-muted-foreground">vs kemarin</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
              {beans.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Belum ada penjualan dalam 30 hari terakhir.
                </p>
              )}
              {beans.map((b) => {
                const pct = Math.round((b.stock / b.max) * 100);
                const tone =
                  b.status === "Kritis" ? "bg-red-500/10 text-red-700 border-red-500/20"
                  : b.status === "Menipis" ? "bg-crema/30 text-roast border-crema/40"
                  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
                return (
                  <div key={b.id} className="rounded-xl border border-border/60 p-4 hover:bg-secondary/40 transition-colors">
                   <Link href={`/beans/${b.id}`} className="flex items-start justify-between gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg gradient-bean flex items-center justify-center shrink-0">
                          <Coffee className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.origin} · {b.trxCount}x transaksi</div>
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
                   </Link>
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
                  {alert ? (
                    <><strong>{alert.name}</strong> tersisa {alert.stock} kg. Segera lakukan restock.</>
                  ) : (
                    <>Semua stok dalam batas aman. Tidak ada tindakan mendesak.</>
                  )}
                </p>
               <Button
                  size="sm"
                  className="mt-4 w-full bg-crema/40 text-primary-foreground hover:bg-crema/30"
                  onClick={() => setShowPO(true)}
                >
                  Place Purchase Order
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display">Transaksi Terakhir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {recent.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrx(t)}
                    className="flex items-start justify-between gap-3 p-3 -mx-3 rounded-lg border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/60 transition-colors"
                  >
                    <div className="min-w-0 pointer-events-none">
                      <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                      <div className="text-sm font-medium truncate">{t.item}</div>
                      <div className="text-xs text-muted-foreground">{t.timeAgo} · {t.method}</div>
                    </div>
                    <span className="font-medium tabular-nums text-sm pointer-events-none">{t.displayTotal}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {selectedTrx && (
        <DetailModal
          trx={selectedTrx}
          onClose={() => setSelectedTrx(null)}
        />
      )}

      {showPO && (
        <BuatPOModal
          suppliers={suppliers}
          onClose={() => setShowPO(false)}
          onSave={(po: Omit<PO, "id">) => {
            handleSavePO(po);
            setShowPO(false);
          }}
        />
      )}
    </>
  );
}