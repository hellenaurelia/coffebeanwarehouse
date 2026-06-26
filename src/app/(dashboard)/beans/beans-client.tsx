"use client";
import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coffee, Search, Plus, MapPin, Sparkles, Leaf } from "lucide-react";
import Link from "next/link";
import type { BeanCatalogItem } from "./_data/repository";

const typeFilters = ["Semua", "Arabica", "Robusta", "Liberica", "Luwak"] as const;

const typeTone: Record<string, string> = {
  Arabica: "bg-accent/15 text-accent border-accent/30",
  Robusta: "bg-bean/15 text-bean border-bean/30",
  Liberica: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Luwak: "bg-crema/40 text-roast border-crema/50",
};

export default function BeansClient({ initial }: { initial: BeanCatalogItem[] }) {
  const [filter, setFilter] = useState<(typeof typeFilters)[number]>("Semua");
  const [q, setQ] = useState("");
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const list = initial.filter(
    (b) => (filter === "Semua" || b.type === filter) && b.name.toLowerCase().includes(q.toLowerCase()),
  );

  const varietyCount = new Set(initial.map((b) => b.type)).size;

  return (
    <>
      <Topbar title="Biji Kopi" subtitle="Katalog jenis biji kopi nusantara" />
      <main className="flex-1 p-6 space-y-6">
        <Card className="overflow-hidden border-0 shadow-warm">
          <div className="relative gradient-bean p-7 text-primary-foreground">
            <div className="relative z-10 max-w-2xl space-y-2">
              <Badge className="bg-primary-foreground/15 text-primary-foreground border-0 backdrop-blur">
                <Leaf className="h-3 w-3 mr-1" /> {initial.length} jenis · {varietyCount} varietas
              </Badge>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">
                Biji kopi pilihan dari penjuru nusantara
              </h2>
              <p className="text-primary-foreground/75 text-sm">
                Arabica, Robusta, Liberica hingga Luwak — semua dalam bentuk green bean siap distribusi.
              </p>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-crema/20 blur-3xl" />
          </div>
        </Card>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari biji kopi…"
              className="h-10 pl-10 rounded-xl bg-secondary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`h-9 px-4 rounded-full text-sm border transition-colors ${
                  filter === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
                }`}
              >
                {t}
              </button>
            ))}
            <Button className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Tambah Jenis
            </Button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Belum ada biji kopi yang cocok.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <Link key={b.id} href={`/beans/${b.id}`}>
                <Card className="overflow-hidden border-border/60 hover:shadow-warm transition-all group cursor-pointer">
                  <div className="aspect-[5/3] gradient-bean relative flex items-center justify-center">
                    <Coffee className="h-16 w-16 text-primary-foreground/80 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className={`absolute top-3 left-3 ${typeTone[b.type] ?? "bg-secondary/60"}`}>
                      {b.type || "—"}
                    </Badge>
                    {b.rating > 0 && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs text-primary-foreground bg-primary/40 backdrop-blur rounded-full px-2 py-0.5">
                        <Sparkles className="h-3 w-3" /> {b.rating}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {b.origin}{b.process !== "—" ? ` · ${b.process}` : ""}
                      </div>
                    </div>
                    {b.notes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {b.notes.map((n) => (
                          <Badge key={n} variant="outline" className="text-[10px] bg-secondary/60">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end justify-between pt-2 border-t border-border/60">
                      <div>
                        <div className="font-display text-lg font-semibold">{fmt(b.price)}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per kg</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium tabular-nums">{b.stock} kg</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">stok</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}