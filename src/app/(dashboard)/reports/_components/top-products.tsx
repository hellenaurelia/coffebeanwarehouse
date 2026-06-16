"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import { fmt } from "./utils";
import { DashboardData } from "./types";

interface TopProductsProps {
  data: DashboardData;
}

/**
 * Komponen Top Products - menampilkan daftar 5 barang terlaris
 */
export function TopProducts({ data }: TopProductsProps) {
  return (
    <Card className="lg:col-span-3 border-border/60 bg-card shadow-warm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">Top 5 Barang Terlaris</CardTitle>
        <p className="text-xs text-muted-foreground">Berdasarkan jumlah transaksi periode ini</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {data.topProducts.map((p) => (
            <div
              key={p.sku}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-crema font-display text-sm font-semibold text-primary-foreground shadow-warm">
                {p.rank}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
                <Coffee className="h-4 w-4 text-bean" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.sku} · {p.kg} kg terjual
                </p>
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
  );
}