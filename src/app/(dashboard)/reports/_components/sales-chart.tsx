"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { chartConfig } from "./data";
import { fmtK } from "./utils";
import { DashboardData } from "./types";

interface SalesChartProps {
  data: DashboardData;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="lg:col-span-2 border-border/60 bg-card shadow-warm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-display text-lg">Grafik Penjualan</CardTitle>
          <p className="text-xs text-muted-foreground">Perbandingan pendapatan & pengeluaran</p>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={[...data.sales]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-bean)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-bean)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPengeluaran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-roast)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-roast)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis
              tickFormatter={(v) => `${v / 1_000_000}Jt`}
              tickLine={false}
              axisLine={false}
              className="text-xs"
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="capitalize text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium">{fmtK(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="penjualan"
              stroke="var(--color-bean)"
              strokeWidth={2.5}
              fill="url(#gPenjualan)"
            />
            <Area
              type="monotone"
              dataKey="pengeluaran"
              stroke="var(--color-roast)"
              strokeWidth={2}
              fill="url(#gPengeluaran)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}