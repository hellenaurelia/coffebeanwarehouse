"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { fmt } from "./utils";
import { DashboardData } from "./types";

interface ExpenseBreakdownProps {
  data: DashboardData;
}

interface InventoryItem {
  sku: string;
  name: string;
  type: string;
  cost: number;
  price: number;
}

const inventoryItems: InventoryItem[] = [
  { sku: "GYO-WN-001", name: "Gayo Wine Natural",   type: "Arabica",  cost: 165_000, price: 280_000 },
  { sku: "KIN-HN-002", name: "Kintamani Honey",      type: "Arabica",  cost: 140_000, price: 240_000 },
  { sku: "TRJ-SP-003", name: "Toraja Sapan",          type: "Arabica",  cost: 180_000, price: 310_000 },
  { sku: "LWK-PR-004", name: "Luwak Premium",         type: "Luwak",    cost: 780_000, price: 1_250_000 },
  { sku: "LMP-RB-005", name: "Lampung Robusta AAA",   type: "Robusta",  cost: 78_000,  price: 145_000 },
  { sku: "LBR-MR-006", name: "Liberica Meranti",      type: "Liberica", cost: 105_000, price: 185_000 },
];

const beanTypeTone = (type: string): string =>
  ({
    Arabica:  "bg-sky-500/10 text-sky-700 border-sky-500/20",
    Robusta:  "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Liberica: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    Luwak:    "bg-rose-500/10 text-rose-700 border-rose-500/20",
  } as Record<string, string>)[type] ?? "bg-secondary text-muted-foreground border-border";

const BAR_COLORS = [
  "bg-bean",
  "bg-bean/80",
  "bg-bean/65",
  "bg-bean/50",
  "bg-bean/38",
];

export function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
  const [hoveredSku, setHoveredSku] = useState<string | null>(null);

  const ranked = inventoryItems
    .map((item) => ({
      ...item,
      marginPct:     ((item.price - item.cost) / item.price) * 100,
      marginNominal: item.price - item.cost,
    }))
    .sort((a, b) => b.marginPct - a.marginPct)
    .slice(0, 5);

  const highest = ranked[0];
  const maxPct  = highest.marginPct;

  return (
    <Card className="shadow-soft border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="font-display">Top Margin Produk</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Gross margin per kg · 5 tertinggi</p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]"
        >
          <TrendingUp className="mr-1 h-3 w-3" />
          {highest.marginPct.toFixed(1)}% tertinggi
        </Badge>
      </CardHeader>

      <CardContent className="space-y-1 pb-5">
        {ranked.map((item, i) => {
          const isHovered = hoveredSku === item.sku;
          return (
            <div
              key={item.sku}
              onMouseEnter={() => setHoveredSku(item.sku)}
              onMouseLeave={() => setHoveredSku(null)}
              className="rounded-lg px-2 py-2 -mx-2 transition-colors cursor-default hover:bg-secondary/60"
            >
              {/* Name row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 shrink-0 text-center text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-4 ${beanTypeTone(item.type)}`}
                  >
                    {item.type}
                  </Badge>
                </div>
                <span className={`shrink-0 text-sm font-bold tabular-nums ${i === 0 ? "text-emerald-600" : ""}`}>
                  {item.marginPct.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-4 shrink-0" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${BAR_COLORS[i]}`}
                    style={{ width: `${(item.marginPct / maxPct) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                  {fmt(item.marginNominal)}/kg
                </span>
              </div>

              {/* Expand detail on hover */}
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isHovered ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-6 flex items-center gap-4 rounded-md bg-secondary/60 px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">
                      Harga jual
                      <span className="ml-1.5 font-medium text-foreground tabular-nums">{fmt(item.price)}</span>
                    </div>
                    <div className="h-3 w-px bg-border" />
                    <div className="text-[11px] text-muted-foreground">
                      Harga Beli
                      <span className="ml-1.5 font-medium text-foreground tabular-nums">{fmt(item.cost)}</span>
                    </div>
                    <div className="h-3 w-px bg-border" />
                    <div className="text-[11px] text-muted-foreground">
                      SKU
                      <span className="ml-1.5 font-mono font-medium text-foreground">{item.sku}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Insight footer */}
        <div className="mt-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{highest.name}</span> unggul dengan margin{" "}
          <span className="font-medium text-foreground">{highest.marginPct.toFixed(1)}%</span>
          {" "}— keuntungan{" "}
          <span className="font-medium text-foreground">{fmt(highest.marginNominal)}</span> per kg.
        </div>
      </CardContent>
    </Card>
  );
}