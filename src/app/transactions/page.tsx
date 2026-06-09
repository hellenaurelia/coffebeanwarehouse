"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, Download, Receipt, Banknote, CreditCard, QrCode,
  ArrowUpRight, Calendar, Eye,
} from "lucide-react";

type Trx = {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: number;
  total: number;
  method: "Cash" | "Kartu" | "QRIS";
  status: "Lunas" | "Refund" | "Pending";
};

const data: Trx[] = [
  { id: "TRX-2050", date: "9 Mei 2026", time: "10:42", cashier: "Arif R.", items: 3, total: 414000, method: "QRIS", status: "Lunas" },
  { id: "TRX-2049", date: "9 Mei 2026", time: "10:31", cashier: "Sari N.", items: 2, total: 184000, method: "QRIS", status: "Lunas" },
  { id: "TRX-2048", date: "9 Mei 2026", time: "10:18", cashier: "Arif R.", items: 1, total: 240000, method: "Cash", status: "Lunas" },
  { id: "TRX-2047", date: "9 Mei 2026", time: "09:54", cashier: "Bayu P.", items: 2, total: 198000, method: "Kartu", status: "Lunas" },
  { id: "TRX-2046", date: "9 Mei 2026", time: "09:33", cashier: "Sari N.", items: 1, total: 92000, method: "QRIS", status: "Refund" },
  { id: "TRX-2045", date: "9 Mei 2026", time: "09:11", cashier: "Arif R.", items: 4, total: 528000, method: "Cash", status: "Lunas" },
  { id: "TRX-2044", date: "8 Mei 2026", time: "20:48", cashier: "Bayu P.", items: 2, total: 312000, method: "Kartu", status: "Lunas" },
  { id: "TRX-2043", date: "8 Mei 2026", time: "20:22", cashier: "Sari N.", items: 1, total: 124000, method: "QRIS", status: "Lunas" },
  { id: "TRX-2042", date: "8 Mei 2026", time: "19:57", cashier: "Arif R.", items: 3, total: 376000, method: "Cash", status: "Lunas" },
];

const methodIcon = { Cash: Banknote, Kartu: CreditCard, QRIS: QrCode } as const;

const statusTone = (s: Trx["status"]) =>
  s === "Lunas" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
  : s === "Refund" ? "bg-destructive/10 text-destructive border-destructive/30"
  : "bg-crema/40 text-roast border-crema/50";

export default function TransactionsPage() {
  const [filter, setFilter] = useState<"Semua" | Trx["method"]>("Semua");
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const rows = data.filter((t) => filter === "Semua" || t.method === filter);
  const totalToday = data.filter((t) => t.date === "9 Mei 2026" && t.status === "Lunas").reduce((a, b) => a + b.total, 0);

  return (
    <>
      <Topbar title="Transaksi" subtitle="Riwayat penjualan & rekonsiliasi kasir" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Penjualan Hari Ini", value: fmt(totalToday), sub: "6 transaksi lunas", icon: Receipt },
            { label: "Rata-rata Basket", value: "Rp 226.000", sub: "+8% vs minggu lalu", icon: ArrowUpRight },
            { label: "Refund", value: "1", sub: "Rp 92.000 dikembalikan", icon: Calendar },
            { label: "Metode Terpopuler", value: "QRIS", sub: "44% transaksi", icon: QrCode },
          ].map((s) => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari ID transaksi atau kasir…" className="h-10 pl-10 rounded-xl bg-secondary/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Semua", "Cash", "Kartu", "QRIS"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilter(m)}
                    className={`h-9 px-4 rounded-full text-sm border transition-colors ${
                      filter === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
                    }`}
                  >
                    {m}
                  </button>
                ))}
                <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4 mr-2" />Tanggal</Button>
                <Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2" />Ekspor</Button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-3 py-3">ID Transaksi</th>
                    <th className="text-left font-medium px-3 py-3">Tanggal</th>
                    <th className="text-left font-medium px-3 py-3">Kasir</th>
                    <th className="text-right font-medium px-3 py-3">Item</th>
                    <th className="text-right font-medium px-3 py-3">Total</th>
                    <th className="text-left font-medium px-3 py-3">Metode</th>
                    <th className="text-center font-medium px-3 py-3">Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => {
                    const Icon = methodIcon[t.method];
                    return (
                      <tr key={t.id} className="border-t border-border/60 hover:bg-secondary/40">
                        <td className="px-3 py-4 font-mono text-xs">{t.id}</td>
                        <td className="px-3 py-4">
                          <div className="text-sm">{t.date}</div>
                          <div className="text-xs text-muted-foreground">{t.time}</div>
                        </td>
                        <td className="px-3 py-4">{t.cashier}</td>
                        <td className="px-3 py-4 text-right tabular-nums">{t.items}</td>
                        <td className="px-3 py-4 text-right tabular-nums font-medium">{fmt(t.total)}</td>
                        <td className="px-3 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {t.method}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <Badge variant="outline" className={statusTone(t.status)}>{t.status}</Badge>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                            <Eye className="h-4 w-4 mr-1" /> Detail
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}