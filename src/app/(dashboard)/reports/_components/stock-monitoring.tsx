"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown } from "lucide-react";
import { statusTone } from "./utils";
import { DashboardData } from "./types";

interface StockMonitoringProps {
  data: DashboardData;
}

/**
 * Komponen Stock Monitoring - menampilkan progress bar stok per varian
 */
export function StockMonitoring({ data }: StockMonitoringProps) {
  const kritisStock = data.stok.filter((s) => s.status === "Kritis");

  return (
    <Card className="lg:col-span-2 border-border/60 bg-card shadow-warm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-display text-lg">Monitoring Stok Gudang</CardTitle>
          <p className="text-xs text-muted-foreground">Level kapasitas per varian</p>
        </div>
        <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/5 text-destructive">
          <TrendingDown className="mr-1 h-3 w-3" /> {data.kritisCount} kritis
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {kritisStock.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Tidak ada stok kritis saat ini.
          </p>
        ) : (
          kritisStock.map((s) => {
            const pct = Math.round((s.stok / s.kapasitas) * 100);
            return (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                  <Badge variant="outline" className={`rounded-full text-[10px] ${statusTone(s.status)}`}>
                    {s.status}
                  </Badge>
                </div>
                <Progress value={pct} className="h-2 bg-secondary" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {s.stok} kg / {s.kapasitas} kg
                  </span>
                  <span className="font-mono">{pct}%</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}