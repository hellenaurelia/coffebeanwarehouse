"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Coffee,
  Plus,
  Trash2,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  Percent,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  variant: string;
  price: number;
  tag: string;
};

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

export default function POSPage() {
  const [cart, setCart] = useState<Record<string, number>>({ p1: 1, p7: 2 });
  const [cat, setCat] = useState("Semua");
  const [search, setSearch] = useState("");
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});
  const [payMethod, setPayMethod] = useState<string | null>(null);
  const [discOpen, setDiscOpen] = useState(false);
  const [discInput, setDiscInput] = useState("");
  const [discPct, setDiscPct] = useState(0);

  const filtered = products.filter(
    (p) =>
      (cat === "Semua" || p.tag === cat) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.variant.toLowerCase().includes(search.toLowerCase()))
  );

  const lines = Object.entries(cart).map(([id, qty]) => ({
    p: products.find((x) => x.id === id)!,
    qty,
  }));
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const discAmt = Math.round(subtotal * discPct / 100);
  const afterDisc = subtotal - discAmt;
  const tax = Math.round(afterDisc * 0.11);
  const total = afterDisc + tax;

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  const del = (id: string) =>
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });

  const commitQty = (id: string) => {
    const value = parseFloat(editingQty[id] ?? String(cart[id]));
    if (!isNaN(value) && value > 0) {
      setCart((c) => ({ ...c, [id]: value }));
    } else {
      del(id);
    }
    setEditingQty((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const applyDisc = () => {
    const v = parseFloat(discInput);
    setDiscPct(!isNaN(v) && v >= 0 && v <= 100 ? v : 0);
    setDiscOpen(false);
  };

  const processPayment = () => {
    setCart({});
    setPayMethod(null);
    setDiscPct(0);
    setDiscInput("");
  };

  const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

  const payLabels: Record<string, string> = { cash: "Cash", card: "Kartu", qris: "QRIS" };

  return (
    <>
      <Topbar
        title="Kasir / Point of Sale"
        subtitle="Counter Senopati · Shift Pagi"
      />
      <main className="flex-1 grid lg:grid-cols-[1fr_420px] min-h-0">
        {/* Catalog */}
        <section className="p-6 space-y-5 overflow-y-auto">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Scan barcode atau cari produk…"
              className="h-11 pl-10 rounded-xl bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Produk tidak ditemukan.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p.id)}
                className="group text-left rounded-2xl border border-border/60 bg-card p-4 hover:shadow-warm hover:border-accent/40 transition-all"
              >
                <div className="aspect-square rounded-xl gradient-bean mb-3 flex items-center justify-center relative overflow-hidden">
                  <Coffee className="h-10 w-10 text-primary-foreground/90" />
                  <Badge className="absolute top-2 left-2 bg-primary-foreground/20 text-primary-foreground border-0 backdrop-blur text-[10px]">
                    {p.tag}
                  </Badge>
                  {cart[p.id] && (
                    <span className="absolute bottom-2 right-2 bg-primary-foreground/90 text-primary text-[10px] font-semibold rounded-full px-2 py-0.5">
                      {cart[p.id]} kg
                    </span>
                  )}
                </div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.variant}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-base font-semibold">
                    {fmt(p.price)}/kg
                  </span>
                  <span className="h-7 w-7 rounded-full gradient-crema flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cart */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] border-l border-border bg-card flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Order #2050
            </div>
            <h3 className="font-display text-xl font-semibold">Pesanan Aktif</h3>
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
                    <button
                      onClick={() => del(p.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-20 text-center rounded-lg bg-card border-border"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={editingQty[p.id] ?? String(qty)}
                        onChange={(e) =>
                          setEditingQty((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitQty(p.id);
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={() => commitQty(p.id)}
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                    <span className="font-medium tabular-nums text-sm">
                      {fmt(p.price * qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-5 space-y-4">
            <div>
              <button
                className="flex items-center gap-2 text-sm text-accent hover:underline"
                onClick={() => setDiscOpen((v) => !v)}
              >
                <Percent className="h-4 w-4" /> Tambah diskon / promo
              </button>
              {discOpen && (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="% diskon"
                    min={0}
                    max={100}
                    step={1}
                    value={discInput}
                    onChange={(e) => setDiscInput(e.target.value)}
                    className="h-8 w-28 rounded-lg bg-card border-border text-sm"
                  />
                  <Button size="sm" onClick={applyDisc}>
                    Terapkan
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(subtotal)}</span>
              </div>
              {discAmt > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon {discPct}%</span>
                  <span className="tabular-nums">−{fmt(discAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>PPN 11%</span>
                <span className="tabular-nums">{fmt(tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-display text-xl font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "qris"] as const).map((m) => (
                <Button
                  key={m}
                  variant={payMethod === m ? "default" : "outline"}
                  className="h-12 flex-col gap-0.5 text-xs"
                  onClick={() => setPayMethod(m)}
                >
                  {m === "cash" && <Banknote className="h-4 w-4" />}
                  {m === "card" && <CreditCard className="h-4 w-4" />}
                  {m === "qris" && <QrCode className="h-4 w-4" />}
                  {payLabels[m]}
                </Button>
              ))}
            </div>

            <Button
              className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm"
              disabled={lines.length === 0 || !payMethod}
              onClick={processPayment}
            >
              {lines.length === 0
                ? "Pilih produk terlebih dahulu"
                : !payMethod
                ? "Pilih metode pembayaran"
                : `Proses Pembayaran · ${fmt(total)}`}
            </Button>
          </div>
        </aside>
      </main>
    </>
  );
}