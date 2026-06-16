"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, CalendarDays, BarChart3 } from "lucide-react";
import { DateRange } from "./_components/types";
import { dataByRange } from "./_components/data";
import { exportToPDF, formatDateID, generateDataForRange } from "./_components/utils";
import { CalendarPicker } from "./_components/calendar-picker";
import { KPICards } from "./_components/kpi-cards";
import { SalesChart } from "./_components/sales-chart";
import { ExpenseBreakdown } from "./_components/margin-breakdown";
import { TopProducts } from "./_components/top-products";
import { StockMonitoring } from "./_components/stock-monitoring";

const PRESET_RANGES = [
  { key: "7H" as const,  label: "7 Hari" },
  { key: "30H" as const, label: "30 Hari" },
  { key: "90H" as const, label: "90 Hari" },
];

export default function DashboardPage() {
  const [rangeKey, setRangeKey]           = useState<"7H" | "30H" | "90H" | null>("7H");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ from: null, to: null });

  const isCustomActive = !!(customDateRange.from && customDateRange.to);

  const data = useMemo(() => {
    if (isCustomActive) return generateDataForRange(customDateRange.from!, customDateRange.to!);
    return dataByRange[rangeKey ?? "7H"];
  }, [rangeKey, customDateRange, isCustomActive]);

  const periodeLabel = useMemo(() => {
    if (isCustomActive)
      return `${formatDateID(customDateRange.from!, "long")} – ${formatDateID(customDateRange.to!, "long")}`;
    if (rangeKey) return dataByRange[rangeKey].label;
    return "—";
  }, [rangeKey, customDateRange, isCustomActive]);

  const handlePresetRange = (key: "7H" | "30H" | "90H") => {
    setRangeKey(key);
    setCustomDateRange({ from: null, to: null });
    setIsCalendarOpen(false);
  };

  const handleCustomRange = (range: DateRange) => {
    setCustomDateRange(range);
    if (range.from && range.to) setRangeKey(null);
  };

  const handleExportPDF = () => {
    const totalPenjualan   = data.sales.reduce((s, d) => s + d.penjualan, 0);
    const totalPengeluaran = data.expense.reduce((s, e) => s + e.nominal, 0);
    exportToPDF({
      title: "Laporan Penjualan Kopi",
      fileName: `laporan-${new Date().getTime()}.pdf`,
      tableData: {
        headers: ["Rank", "Produk", "SKU", "Terjual", "Kg", "Omzet"],
        rows: data.topProducts.map((p) => [p.rank, p.name, p.sku, p.terjual, p.kg, `Rp ${p.omzet.toLocaleString("id-ID")}`]),
      },
      summaryData: [
        { label: "Periode",           value: periodeLabel },
        { label: "Total Penjualan",   value: `Rp ${totalPenjualan.toLocaleString("id-ID")}` },
        { label: "Total Pengeluaran", value: `Rp ${totalPengeluaran.toLocaleString("id-ID")}` },
      ],
    });
  };

  return (
    <>
      <Topbar title="Dashboard Penjualan Kopi" />

      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-screen-xl space-y-8 px-6 py-8">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Overview
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                Dashboard Penjualan
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Periode aktif:{" "}
                <span className="font-medium text-foreground">{periodeLabel}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Period filter group */}
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-0.5">
                {PRESET_RANGES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handlePresetRange(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      rangeKey === key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom date range */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={`gap-2 text-xs ${
                    isCustomActive
                      ? "border-bean/50 bg-bean/5 text-bean hover:bg-bean/10"
                      : ""
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {isCustomActive
                    ? `${formatDateID(customDateRange.from!)} – ${formatDateID(customDateRange.to!)}`
                    : "Custom"}
                </Button>
                {isCalendarOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <CalendarPicker
                      value={customDateRange}
                      onChange={handleCustomRange}
                      onClose={() => setIsCalendarOpen(false)}
                    />
                  </div>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Export */}
              <Button
                size="sm"
                onClick={handleExportPDF}
                className="gap-2 bg-bean text-white hover:bg-bean/90 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* ── KPI Cards ───────────────────────────────────────────────── */}
          <KPICards data={data} />

          {/* ── Charts Row ──────────────────────────────────────────────── */}
          <section>
            <SectionLabel icon={BarChart3} title="Analitik Penjualan" subtitle="Tren & breakdown periode ini" />
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <SalesChart data={data} />
              <ExpenseBreakdown data={data} />
            </div>
          </section>

          {/* ── Products & Stock ────────────────────────────────────────── */}
          <section>
            <SectionLabel icon={BarChart3} title="Produk & Inventori" subtitle="Performa produk dan status gudang" />
            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <TopProducts data={data} />
              <StockMonitoring data={data} />
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

// ── Section Label helper ─────────────────────────────────────────────────────
function SectionLabel({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bean/10">
        <Icon className="h-4 w-4 text-bean" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="ml-3 h-px flex-1 bg-border/60" />
    </div>
  );
}