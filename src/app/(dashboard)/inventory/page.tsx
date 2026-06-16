"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Coffee, Search, Filter, Download, Plus, Package } from "lucide-react";
import { FilterModal, FilterValues } from "./_components/filter-modal";
import InventoryDetailDialog from "./_components/modal-detail-edit";
import { RekonsiliasiModal } from "./_components/rekonsiliasi-modal";
import { exportToCSV } from "./_components/export-utils";
import { useInventorySearch } from "./_components/search-hooks";

export interface InventoryItem {
  sku: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  exp: string;
  supplier: string;
  photo?: string;
}

const initialItems: InventoryItem[] = [
  { sku: "GYO-WN-001", name: "Gayo Wine Natural",    type: "Arabica",  stock: 142, unit: "kg", cost: 165000, price: 280000, exp: "Mar 2027", supplier: "CV Gayo Mandiri" },
  { sku: "KIN-HN-002", name: "Kintamani Honey",       type: "Arabica",  stock: 38,  unit: "kg", cost: 140000, price: 240000, exp: "Feb 2027", supplier: "UD Subak Bali" },
  { sku: "TRJ-SP-003", name: "Toraja Sapan",           type: "Arabica",  stock: 96,  unit: "kg", cost: 180000, price: 310000, exp: "Jan 2027", supplier: "PT Toraja Coffee" },
  { sku: "LWK-PR-004", name: "Luwak Premium",          type: "Luwak",    stock: 8,   unit: "kg", cost: 780000, price: 1250000, exp: "—",       supplier: "CV Luwak Nusantara" },
  { sku: "LMP-RB-005", name: "Lampung Robusta AAA",    type: "Robusta",  stock: 220, unit: "kg", cost: 78000,  price: 145000, exp: "Mar 2027", supplier: "PT Sinar Robusta" },
  { sku: "LBR-MR-006", name: "Liberica Meranti",       type: "Liberica", stock: 24,  unit: "kg", cost: 105000, price: 185000, exp: "—",       supplier: "UD Riau Kopi" },
];

const stockTone = (s: number) =>
  s < 25 ? "bg-red-500/10 text-red-700 border-red-500/20"
  : s < 60 ? "bg-crema/40 text-roast border-crema/50"
  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";

const beanTypeTone = (type: string): string =>
  ({
    Arabica:  "bg-sky-500/10 text-sky-700 border-sky-500/20",
    Robusta:  "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Liberica: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    Luwak:    "bg-rose-500/10 text-rose-700 border-rose-500/20",
  } as Record<string, string>)[type] ?? "bg-secondary text-muted-foreground border-border";

const stockLabel = (s: number) => (s < 25 ? "Kritis" : s < 60 ? "Menipis" : "Aman");

export default function Inventory() {
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tambahOpen, setTambahOpen] = useState(false);
  const [rekonOpen, setRekonOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({ type: [], stockStatus: [] });

  const { query, setQuery, filtered } = useInventorySearch(items, activeFilters);

  const reorderCount = items.filter((i) => i.stock < 25).length;
  const totalStock = items.reduce((a, b) => a + b.stock, 0);
  const totalValue = items.reduce((a, b) => a + b.stock * b.cost, 0);

  return (
    <>
      <Topbar title="Inventory · Biji Kopi" subtitle="Manajemen stok green bean per jenis & origin" />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total SKU",       value: `${items.length}`,                       sub: "Arabica · Robusta · Liberica · Luwak" },
            { label: "Total Stok",      value: `${totalStock.toLocaleString("id-ID")} kg`,    sub: "Green bean nusantara" },
            { label: "Nilai Inventori", value: `Rp ${(totalValue/1_000_000).toFixed(0)} jt`, sub: "Estimasi cost" },
            { label: "Perlu Re-order",  value: `${reorderCount} SKU`,                         sub: "Stok < 25 kg" },
          ].map((s) => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-display text-2xl font-semibold mt-2">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rekonsiliasi Banner */}
        <Card className="shadow-soft border-border/60 from-secondary/60 to-card">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-warm">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Rekonsiliasi Stok</h3>
              <p className="text-sm text-muted-foreground">Hitung ulang fisik gudang dan sinkronkan dengan sistem.</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRekonOpen(true)}>
              Mulai Rekonsiliasi
            </Button>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari SKU, nama, atau supplier…" className="h-10 pl-10 rounded-xl bg-secondary/50"
                  value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setFilterOpen(true)}>
                  <Filter className="h-4 w-4 mr-2" />Filter
                  {(activeFilters.type.length + activeFilters.stockStatus.length) > 0 && (
                    <Badge className="ml-2 h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                      {activeFilters.type.length + activeFilters.stockStatus.length}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => exportToCSV(filtered)}>
                  <Download className="h-4 w-4 mr-2" />Ekspor
                </Button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-3 py-3">Produk</th>
                    <th className="text-left font-medium px-3 py-3">SKU</th>
                    <th className="text-left font-medium px-3 py-3">Supplier</th>
                    <th className="text-left font-medium px-3 py-3">Tipe</th>
                    <th className="text-left font-medium px-3 py-3">Exp.</th>
                    <th className="text-right font-medium px-3 py-3">Stok</th>
                    <th className="text-right font-medium px-3 py-3">Harga Beli</th>
                    <th className="text-right font-medium px-3 py-3">Harga Jual</th>
                    <th className="text-center font-medium px-3 py-3">Status</th>
                    <th className="text-center font-medium px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-muted-foreground text-sm">
                        Tidak ada item yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : filtered.map((it) => (
                    <tr key={it.sku} className="border-t border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-border/40">
                            {it.photo ? (
                              <img src={it.photo} alt={it.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full gradient-bean flex items-center justify-center">
                                <Coffee className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="font-medium">{it.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{it.sku}</td>
                      <td className="px-3 py-4 text-sm text-muted-foreground">{it.supplier}</td>
                      <td className="px-3 py-4"><Badge variant="outline" className={`text-xs ${beanTypeTone(it.type)}`}>{it.type}</Badge></td>
                      <td className="px-3 py-4 text-sm text-muted-foreground">{it.exp}</td>
                      <td className="px-3 py-4 text-right tabular-nums font-medium">{it.stock} <span className="text-muted-foreground font-normal">{it.unit}</span></td>
                      <td className="px-3 py-4 text-right tabular-nums text-muted-foreground">{fmt(it.cost)}</td>
                      <td className="px-3 py-4 text-right tabular-nums font-medium">{fmt(it.price)}</td>
                      <td className="px-3 py-4 text-center">
                        <Badge variant="outline" className={stockTone(it.stock)}>{stockLabel(it.stock)}</Badge>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 px-3" onClick={() => setDetailItem(it)}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} items={items} values={activeFilters} onChange={setActiveFilters} />
      <RekonsiliasiModal open={rekonOpen} onClose={() => setRekonOpen(false)} items={items} onSave={(updated) => setItems(updated)} />
      <InventoryDetailDialog
        open={!!detailItem}
        item={detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
        onSave={(updated) => {
          setItems((prev) => prev.map((i) => (i.sku === updated.sku ? updated : i)));
          setDetailItem(updated);
        }}
      />
    </>
  );
}