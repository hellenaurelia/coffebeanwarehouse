import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Coffee, Search, Filter, Download, Plus, MapPin, Calendar, Package } from "lucide-react";

export const Route = createFileRoute("/_app/inventory")({
  component: Inventory,
});

const items = [
  { sku: "GYO-WN-001", name: "Gayo Wine Natural", origin: "Aceh", type: "Arabica", process: "Natural", stock: 142, unit: "kg", cost: 165000, price: 280000, harvest: "Mar 2026" },
  { sku: "KIN-HN-002", name: "Kintamani Honey", origin: "Bali", type: "Arabica", process: "Honey", stock: 38, unit: "kg", cost: 140000, price: 240000, harvest: "Feb 2026" },
  { sku: "TRJ-SP-003", name: "Toraja Sapan", origin: "Sulawesi", type: "Arabica", process: "Washed", stock: 96, unit: "kg", cost: 180000, price: 310000, harvest: "Jan 2026" },
  { sku: "LWK-PR-004", name: "Luwak Premium", origin: "Lampung", type: "Luwak", process: "Wild Civet", stock: 8, unit: "kg", cost: 780000, price: 1250000, harvest: "Dec 2025" },
  { sku: "LMP-RB-005", name: "Lampung Robusta AAA", origin: "Lampung", type: "Robusta", process: "Dry", stock: 220, unit: "kg", cost: 78000, price: 145000, harvest: "Mar 2026" },
  { sku: "LBR-MR-006", name: "Liberica Meranti", origin: "Riau", type: "Liberica", process: "Natural", stock: 24, unit: "kg", cost: 105000, price: 185000, harvest: "Feb 2026" },
];

const stockTone = (s: number) =>
  s < 25 ? "bg-destructive/10 text-destructive border-destructive/30"
  : s < 60 ? "bg-crema/40 text-roast border-crema/50"
  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";

const stockLabel = (s: number) => (s < 25 ? "Kritis" : s < 60 ? "Menipis" : "Aman");

function Inventory() {
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
  return (
    <>
      <Topbar title="Inventory · Biji Kopi" subtitle="Manajemen stok green bean per jenis & origin" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total SKU", value: "32", sub: "Arabica · Robusta · Liberica · Luwak" },
            { label: "Total Stok", value: "1.247 kg", sub: "Green bean nusantara" },
            { label: "Nilai Inventori", value: "Rp 218 jt", sub: "Estimasi cost" },
            { label: "Perlu Re-order", value: "3 SKU", sub: "Stok < 25 kg", warn: true },
          ].map((s) => (
            <Card key={s.label} className={`shadow-soft border-border/60 ${s.warn ? "bg-crema/20" : ""}`}>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-display text-2xl font-semibold mt-2">{s.value}</div>
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
                <Input placeholder="Cari SKU, nama, atau origin…" className="h-10 pl-10 rounded-xl bg-secondary/50" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4 mr-2" />Filter</Button>
                <Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2" />Ekspor</Button>
                <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Tambah Biji</Button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-3 py-3">Produk</th>
                    <th className="text-left font-medium px-3 py-3">SKU</th>
                    <th className="text-left font-medium px-3 py-3">Profil</th>
                    <th className="text-right font-medium px-3 py-3">Stok</th>
                    <th className="text-right font-medium px-3 py-3">HPP</th>
                    <th className="text-right font-medium px-3 py-3">Harga Jual</th>
                    <th className="text-center font-medium px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.sku} className="border-t border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg gradient-bean flex items-center justify-center shrink-0">
                            <Coffee className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-3">
                              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{it.origin}</span>
                              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{it.harvest}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{it.sku}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">{it.type}</Badge>
                          <Badge variant="outline" className="text-xs">{it.process}</Badge>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums font-medium">{it.stock} <span className="text-muted-foreground font-normal">{it.unit}</span></td>
                      <td className="px-3 py-4 text-right tabular-nums text-muted-foreground">{fmt(it.cost)}</td>
                      <td className="px-3 py-4 text-right tabular-nums font-medium">{fmt(it.price)}</td>
                      <td className="px-3 py-4 text-center">
                        <Badge variant="outline" className={stockTone(it.stock)}>{stockLabel(it.stock)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/60 bg-gradient-to-br from-secondary/60 to-card">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl gradient-crema flex items-center justify-center shadow-warm">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Stok Opname Cepat</h3>
              <p className="text-sm text-muted-foreground">Hitung ulang fisik gudang dan sinkronkan dengan sistem.</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Mulai Opname</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
