import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coffee, Plus, Minus, Trash2, Search, CreditCard, Banknote, QrCode, Percent } from "lucide-react";

export const Route = createFileRoute("/_app/pos")({
  component: POS,
});

type Product = { id: string; name: string; variant: string; price: number; tag: string };

const products: Product[] = [
  { id: "p1", name: "Gayo Wine Natural", variant: "250g · Whole Bean", price: 92000, tag: "Arabica" },
  { id: "p2", name: "Kintamani Honey", variant: "250g · Ground", price: 78000, tag: "Arabica" },
  { id: "p3", name: "Toraja Sapan", variant: "250g · Whole Bean", price: 98000, tag: "Arabica" },
  { id: "p4", name: "Ethiopia Yirgacheffe", variant: "200g · Whole Bean", price: 124000, tag: "Arabica" },
  { id: "p5", name: "Lampung Robusta AAA", variant: "500g · Whole Bean", price: 86000, tag: "Robusta" },
  { id: "p6", name: "Bengkulu Robusta Fine", variant: "250g · Ground", price: 52000, tag: "Robusta" },
  { id: "p7", name: "Liberica Meranti", variant: "250g · Whole Bean", price: 64000, tag: "Liberica" },
  { id: "p8", name: "Luwak Premium", variant: "100g · Whole Bean", price: 175000, tag: "Luwak" },
  { id: "p9", name: "Java Preanger", variant: "500g · Ground", price: 138000, tag: "Arabica" },
];

const cats = ["Semua", "Arabica", "Robusta", "Liberica", "Luwak"];

function POS() {
  const [cart, setCart] = useState<Record<string, number>>({ p1: 1, p7: 2 });
  const [cat, setCat] = useState("Semua");

  const filtered = products.filter((p) => cat === "Semua" || p.tag === cat);

  const lines = Object.entries(cart).map(([id, qty]) => ({ p: products.find((x) => x.id === id)!, qty }));
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const { [id]: _, ...rest } = c;
      return n <= 0 ? rest : { ...c, [id]: n };
    });
  const del = (id: string) => setCart((c) => { const { [id]: _, ...rest } = c; return rest; });

  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <>
      <Topbar title="Kasir / Point of Sale" subtitle="Counter Senopati · Shift Pagi" />
      <main className="flex-1 grid lg:grid-cols-[1fr_420px] min-h-0">
        {/* Catalog */}
        <section className="p-6 space-y-5 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Scan barcode atau cari produk…" className="h-11 pl-10 rounded-xl bg-card border-border" />
            </div>
            <Button className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-5">
              + Produk Cepat
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 h-9 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  cat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p.id)}
                className="group text-left rounded-2xl border border-border/60 bg-card p-4 hover:shadow-warm hover:border-accent/40 transition-all"
              >
                <div className="aspect-square rounded-xl gradient-bean mb-3 flex items-center justify-center relative overflow-hidden">
                  <Coffee className="h-10 w-10 text-primary-foreground/90" />
                  <Badge className="absolute top-2 left-2 bg-primary-foreground/20 text-primary-foreground border-0 backdrop-blur text-[10px]">
                    {p.tag}
                  </Badge>
                </div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.variant}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-base font-semibold">{fmt(p.price)}</span>
                  <span className="h-7 w-7 rounded-full gradient-crema flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cart */}
        <aside className="border-l border-border bg-card flex flex-col min-h-0">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Order #2050</div>
                <h3 className="font-display text-xl font-semibold">Pesanan Aktif</h3>
              </div>
              <Badge variant="outline" className="border-accent/40 text-accent">Dine-in</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {lines.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Belum ada produk. Pilih dari katalog untuk mulai.
              </div>
            )}
            {lines.map(({ p, qty }) => (
              <div key={p.id} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="h-12 w-12 rounded-lg gradient-bean flex items-center justify-center shrink-0">
                  <Coffee className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.variant}</div>
                    </div>
                    <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background">
                      <button onClick={() => sub(p.id)} className="h-7 w-7 grid place-items-center hover:bg-secondary rounded-l-full">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
                      <button onClick={() => add(p.id)} className="h-7 w-7 grid place-items-center hover:bg-secondary rounded-r-full">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-medium tabular-nums text-sm">{fmt(p.price * qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-5 space-y-4">
            <button className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Percent className="h-4 w-4" /> Tambah diskon / promo
            </button>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PPN 11%</span><span className="tabular-nums">{fmt(tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-display text-xl font-semibold">
                <span>Total</span><span className="tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="h-12 flex-col gap-0.5 text-xs">
                <Banknote className="h-4 w-4" /> Cash
              </Button>
              <Button variant="outline" className="h-12 flex-col gap-0.5 text-xs">
                <CreditCard className="h-4 w-4" /> Kartu
              </Button>
              <Button variant="outline" className="h-12 flex-col gap-0.5 text-xs border-accent/40 text-accent">
                <QrCode className="h-4 w-4" /> QRIS
              </Button>
            </div>

            <Button className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm">
              Proses Pembayaran · {fmt(total)}
            </Button>
          </div>
        </aside>
      </main>
    </>
  );
}
