"use client";

import { useState } from "react";
import { Coffee, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cats, fmt } from "./data";
import { usePOSProducts } from "./pos-context";
import type { Product } from "./types";

interface Props {
  cart: Record<string, number>;
  onAdd: (id: string) => void;
}

export function CatalogPanel({ cart, onAdd }: Props) {
  const products = usePOSProducts();
  const [activeCat, setActiveCat] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p: Product) =>
    (activeCat === "Semua" || p.tag === activeCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="p-4 md:p-6 space-y-4 overflow-y-auto">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari produk…" className="h-11 pl-10 rounded-xl bg-card border-border"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-4 h-9 rounded-full text-sm whitespace-nowrap border transition-colors ${
              activeCat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-secondary"
            }`}>
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">Produk tidak ditemukan.</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p: Product) => (
          <button key={p.id} onClick={() => onAdd(p.id)}
            className="group text-left rounded-2xl border border-border/60 bg-card p-4 hover:shadow-warm hover:border-accent/40 transition-all">
            <div className="aspect-square rounded-xl gradient-bean mb-3 flex items-center justify-center relative overflow-hidden">
              <Coffee className="h-10 w-10 text-primary-foreground/90" />
              <Badge className="absolute top-2 left-2 bg-primary-foreground/20 text-primary-foreground border-0 backdrop-blur text-[10px]">{p.tag}</Badge>
              {cart[p.id] && (
                <span className="absolute bottom-2 right-2 bg-primary-foreground/90 text-primary text-[10px] font-semibold rounded-full px-2 py-0.5">
                  {cart[p.id]} kg
                </span>
              )}
            </div>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.supplier}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-base font-semibold">{fmt(p.price)}/kg</span>
              <span className="h-7 w-7 rounded-full gradient-crema flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}