"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Package,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Dataset per rentang waktu ───────────────────────────────────────────────

const dataByRange = {
  "7H": {
    label: "3 - 9 Mei 2026",
    sales: [
      { day: "Sen", penjualan: 4_120_000, pengeluaran: 1_350_000 },
      { day: "Sel", penjualan: 3_680_000, pengeluaran: 980_000 },
      { day: "Rab", penjualan: 5_240_000, pengeluaran: 2_100_000 },
      { day: "Kam", penjualan: 4_780_000, pengeluaran: 1_420_000 },
      { day: "Jum", penjualan: 6_310_000, pengeluaran: 1_750_000 },
      { day: "Sab", penjualan: 7_890_000, pengeluaran: 2_240_000 },
      { day: "Min", penjualan: 6_540_000, pengeluaran: 1_180_000 },
    ],
    expense: [
      { kategori: "Pembelian Biji", nominal: 6_840_000 },
      { kategori: "Operasional Gudang", nominal: 2_120_000 },
      { kategori: "Gaji Tim", nominal: 1_580_000 },
      { kategori: "Logistik & Kirim", nominal: 480_000 },
    ],
    topProducts: [
      { rank: 1, name: "Arabica Gayo Wine", sku: "ARB-GYW-250", terjual: 142, kg: 35.5, omzet: 17_750_000 },
      { rank: 2, name: "Robusta Lampung AP-1", sku: "ROB-LPG-500", terjual: 128, kg: 64, omzet: 11_520_000 },
      { rank: 3, name: "Arabica Toraja Sapan", sku: "ARB-TRJ-250", terjual: 96, kg: 24, omzet: 14_400_000 },
      { rank: 4, name: "Luwak Liar Bali Kintamani", sku: "LWK-BLI-100", terjual: 54, kg: 5.4, omzet: 21_600_000 },
      { rank: 5, name: "Liberica Jambi Tungkal", sku: "LBR-JMB-250", terjual: 47, kg: 11.75, omzet: 5_405_000 },
    ],
    stok: [
      { name: "Arabica Gayo Wine", stok: 38, kapasitas: 80, status: "Aman" as const },
      { name: "Robusta Lampung AP-1", stok: 124, kapasitas: 200, status: "Aman" as const },
      { name: "Arabica Toraja Sapan", stok: 22, kapasitas: 80, status: "Menipis" as const },
      { name: "Luwak Liar Bali Kintamani", stok: 4, kapasitas: 20, status: "Kritis" as const },
      { name: "Liberica Jambi Tungkal", stok: 61, kapasitas: 120, status: "Aman" as const },
    ],
    pendapatanTrend: "+12,4%",
    pengeluaranTrend: "+4,1%",
    stokKg: "249 kg",
    kritisCount: 2,
  },
  "30H": {
    label: "Apr - 9 Mei 2026",
    sales: [
      { day: "M1", penjualan: 28_400_000, pengeluaran: 9_200_000 },
      { day: "M2", penjualan: 31_700_000, pengeluaran: 10_500_000 },
      { day: "M3", penjualan: 27_900_000, pengeluaran: 8_800_000 },
      { day: "M4", penjualan: 35_600_000, pengeluaran: 11_020_000 },
    ],
    expense: [
      { kategori: "Pembelian Biji", nominal: 24_500_000 },
      { kategori: "Operasional Gudang", nominal: 7_800_000 },
      { kategori: "Gaji Tim", nominal: 6_320_000 },
      { kategori: "Logistik & Kirim", nominal: 1_900_000 },
    ],
    topProducts: [
      { rank: 1, name: "Arabica Gayo Wine", sku: "ARB-GYW-250", terjual: 540, kg: 135, omzet: 67_500_000 },
      { rank: 2, name: "Robusta Lampung AP-1", sku: "ROB-LPG-500", terjual: 498, kg: 249, omzet: 44_820_000 },
      { rank: 3, name: "Luwak Liar Bali Kintamani", sku: "LWK-BLI-100", terjual: 210, kg: 21, omzet: 84_000_000 },
      { rank: 4, name: "Arabica Toraja Sapan", sku: "ARB-TRJ-250", terjual: 380, kg: 95, omzet: 57_000_000 },
      { rank: 5, name: "Liberica Jambi Tungkal", sku: "LBR-JMB-250", terjual: 183, kg: 45.75, omzet: 21_045_000 },
    ],
    stok: [
      { name: "Arabica Gayo Wine", stok: 38, kapasitas: 80, status: "Aman" as const },
      { name: "Robusta Lampung AP-1", stok: 124, kapasitas: 200, status: "Aman" as const },
      { name: "Arabica Toraja Sapan", stok: 22, kapasitas: 80, status: "Menipis" as const },
      { name: "Luwak Liar Bali Kintamani", stok: 4, kapasitas: 20, status: "Kritis" as const },
      { name: "Liberica Jambi Tungkal", stok: 61, kapasitas: 120, status: "Aman" as const },
    ],
    pendapatanTrend: "+8,2%",
    pengeluaranTrend: "+2,7%",
    stokKg: "249 kg",
    kritisCount: 2,
  },
  "90H": {
    label: "Feb - 9 Mei 2026",
    sales: [
      { day: "Feb", penjualan: 98_200_000, pengeluaran: 32_100_000 },
      { day: "Mar", penjualan: 112_400_000, pengeluaran: 38_700_000 },
      { day: "Apr", penjualan: 107_800_000, pengeluaran: 35_200_000 },
      { day: "Mei", penjualan: 38_500_000, pengeluaran: 12_400_000 },
    ],
    expense: [
      { kategori: "Pembelian Biji", nominal: 72_600_000 },
      { kategori: "Operasional Gudang", nominal: 23_400_000 },
      { kategori: "Gaji Tim", nominal: 18_960_000 },
      { kategori: "Logistik & Kirim", nominal: 3_440_000 },
    ],
    topProducts: [
      { rank: 1, name: "Arabica Gayo Wine", sku: "ARB-GYW-250", terjual: 1620, kg: 405, omzet: 202_500_000 },
      { rank: 2, name: "Robusta Lampung AP-1", sku: "ROB-LPG-500", terjual: 1490, kg: 745, omzet: 134_100_000 },
      { rank: 3, name: "Luwak Liar Bali Kintamani", sku: "LWK-BLI-100", terjual: 630, kg: 63, omzet: 252_000_000 },
      { rank: 4, name: "Arabica Toraja Sapan", sku: "ARB-TRJ-250", terjual: 1140, kg: 285, omzet: 171_000_000 },
      { rank: 5, name: "Liberica Jambi Tungkal", sku: "LBR-JMB-250", terjual: 549, kg: 137.25, omzet: 63_135_000 },
    ],
    stok: [
      { name: "Arabica Gayo Wine", stok: 38, kapasitas: 80, status: "Aman" as const },
      { name: "Robusta Lampung AP-1", stok: 124, kapasitas: 200, status: "Aman" as const },
      { name: "Arabica Toraja Sapan", stok: 22, kapasitas: 80, status: "Menipis" as const },
      { name: "Luwak Liar Bali Kintamani", stok: 4, kapasitas: 20, status: "Kritis" as const },
      { name: "Liberica Jambi Tungkal", stok: 61, kapasitas: 120, status: "Aman" as const },
    ],
    pendapatanTrend: "+18,9%",
    pengeluaranTrend: "+6,3%",
    stokKg: "249 kg",
    kritisCount: 2,
  },
} as const;

// ─── Kalender mini ───────────────────────────────────────────────────────────

type DateRange = { from: Date | null; to: Date | null };

const MONTHS_ID = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const DAYS_ID = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

function CalendarPicker({
  value,
  onChange,
  onClose,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hovering, setHovering] = useState<Date | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const inRange = (d: Date) => {
    const end = value.to ?? hovering;
    if (!value.from || !end) return false;
    const [lo, hi] = value.from <= end ? [value.from, end] : [end, value.from];
    return d > lo && d < hi;
  };

  const handleDay = (d: Date) => {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: d, to: null });
    } else {
      const [lo, hi] = value.from <= d ? [value.from, d] : [d, value.from];
      onChange({ from: lo, to: hi });
    }
  };

  const fmtDate = (d: Date | null) =>
    d ? `${d.getDate()} ${MONTHS_ID[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : "—";

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-[300px] rounded-2xl border border-border/60 bg-card shadow-warm p-4"
      onClick={e => e.stopPropagation()}
    >
      {/* Header pilihan */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-secondary/60">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-medium text-sm">
          {MONTHS_ID[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-secondary/60">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Hari */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_ID.map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Tanggal */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = new Date(viewYear, viewMonth, i + 1);
          const isFrom = value.from && isSameDay(day, value.from);
          const isTo = value.to && isSameDay(day, value.to);
          const isInRange = inRange(day);
          const isFuture = day > today;
          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => handleDay(day)}
              onMouseEnter={() => { if (value.from && !value.to) setHovering(day); }}
              onMouseLeave={() => setHovering(null)}
              className={[
                "text-xs h-8 w-full rounded-lg transition-colors",
                isFuture ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-secondary/60",
                isFrom || isTo ? "bg-primary text-primary-foreground font-semibold" : "",
                isInRange ? "bg-primary/15 text-foreground rounded-none" : "",
              ].join(" ")}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Rentang terpilih */}
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{fmtDate(value.from)}</span>
        <span>→</span>
        <span>{fmtDate(value.to)}</span>
      </div>

      {/* Aksi */}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-full text-xs h-8"
          onClick={() => { onChange({ from: null, to: null }); onClose(); }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-full text-xs h-8"
          disabled={!value.from || !value.to}
          onClick={onClose}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusTone = (s: "Aman" | "Menipis" | "Kritis") =>
  s === "Aman"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : s === "Menipis"
      ? "bg-crema/50 text-roast border-crema/60"
      : "bg-destructive/10 text-destructive border-destructive/30";

const chartConfig = {
  penjualan: { label: "Penjualan", color: "hsl(var(--primary))" },
  pengeluaran: { label: "Pengeluaran", color: "hsl(var(--accent))" },
} as const;

// ─── Halaman utama ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [range, setRange] = useState<"7H" | "30H" | "90H">("7H");
  const [showCalendar, setShowCalendar] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange>({ from: null, to: null });
  const [activeCustom, setActiveCustom] = useState(false);

  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const fmtK = (n: number) => "Rp " + (n / 1_000_000).toFixed(1) + " Jt";

  // Pilih dataset aktif
  const data = dataByRange[range];

  const totalPenjualan = useMemo(
    () => data.sales.reduce((a, b) => a + b.penjualan, 0),
    [data]
  );
  const totalPengeluaran = useMemo(
    () => data.expense.reduce((a, b) => a + b.nominal, 0),
    [data]
  );
  const labaBersih = totalPenjualan - totalPengeluaran;
  const margin = ((labaBersih / totalPenjualan) * 100).toFixed(1);

  const calendarLabel = useMemo(() => {
    if (!activeCustom || !customRange.from || !customRange.to) return null;
    const fmt2 = (d: Date) =>
      `${d.getDate()} ${MONTHS_ID[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
    return `${fmt2(customRange.from)} – ${fmt2(customRange.to)}`;
  }, [activeCustom, customRange]);

  const handleRangeTab = (r: "7H" | "30H" | "90H") => {
    setRange(r);
    setActiveCustom(false);
    setCustomRange({ from: null, to: null });
  };

  const handleCalendarApply = () => {
    setShowCalendar(false);
    if (customRange.from && customRange.to) setActiveCustom(true);
  };

  // Export PDF via browser print
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-break { page-break-before: always; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <Topbar title="Laporan" subtitle="Ringkasan performa bisnis & gudang" />
      <main className="flex-1 p-6 space-y-6">

        {/* Header / Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 p-1">
            {(["7H", "30H", "90H"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r && !activeCustom ? "default" : "ghost"}
                className="h-8 rounded-full px-4 text-xs"
                onClick={() => handleRangeTab(r)}
              >
                {r === "7H" ? "7 Hari" : r === "30H" ? "30 Hari" : "90 Hari"}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Kalender custom */}
            <div className="relative">
              <Button
                variant={activeCustom ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setShowCalendar(v => !v)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {calendarLabel ?? (activeCustom ? "Custom" : data.label)}
                {activeCustom && (
                  <span
                    className="ml-2 rounded-full p-0.5 hover:bg-primary-foreground/20"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveCustom(false);
                      setCustomRange({ from: null, to: null });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </Button>
              {showCalendar && (
                <>
                  {/* Overlay untuk tutup kalender */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCalendar(false)}
                  />
                  <CalendarPicker
                    value={customRange}
                    onChange={setCustomRange}
                    onClose={handleCalendarApply}
                  />
                </>
              )}
            </div>

            <Button size="sm" className="rounded-full" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Print header — hanya tampil saat print */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">Laporan Performa Bisnis</h1>
          <p className="text-sm text-gray-500 mt-1">
            {calendarLabel ?? data.label} · Dicetak {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Pendapatan</span>
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(totalPenjualan)}</p>
              <p className="mt-1 inline-flex items-center text-xs text-emerald-700">
                <ArrowUpRight className="mr-1 h-3 w-3" /> {data.pendapatanTrend} vs periode lalu
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Pengeluaran</span>
                <Wallet className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(totalPengeluaran)}</p>
              <p className="mt-1 inline-flex items-center text-xs text-destructive">
                <ArrowDownRight className="mr-1 h-3 w-3" /> {data.pengeluaranTrend} vs periode lalu
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Laba Bersih</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{fmt(labaBersih)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Margin {margin}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-warm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Stok Gudang</span>
                <Package className="h-4 w-4 text-bean" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{data.stokKg}</p>
              <p className="mt-1 inline-flex items-center text-xs text-roast">
                <AlertTriangle className="mr-1 h-3 w-3" /> {data.kritisCount} item perlu re-order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales chart + Expense breakdown */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 bg-card shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-lg">Grafik Penjualan</CardTitle>
                <p className="text-xs text-muted-foreground">Perbandingan pendapatan & pengeluaran</p>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary">
                <TrendingUp className="mr-1 h-3 w-3" /> Tren naik
              </Badge>
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
                  <YAxis tickFormatter={(v) => `${v / 1_000_000}Jt`} tickLine={false} axisLine={false} className="text-xs" width={40} />
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
                  <Area type="monotone" dataKey="penjualan" stroke="var(--color-bean)" strokeWidth={2.5} fill="url(#gPenjualan)" />
                  <Area type="monotone" dataKey="pengeluaran" stroke="var(--color-roast)" strokeWidth={2} fill="url(#gPengeluaran)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-warm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Rincian Pengeluaran</CardTitle>
              <p className="text-xs text-muted-foreground">Periode ini · {fmt(totalPengeluaran)}</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={[...data.expense]} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} className="stroke-border/40" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="kategori"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    className="text-xs"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-mono font-medium">{fmt(Number(value))}</span>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="nominal" fill="var(--color-bean)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ChartContainer>
              <div className="mt-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
                Pembelian biji menyumbang{" "}
                <span className="font-semibold text-foreground">
                  {((data.expense[0].nominal / totalPengeluaran) * 100).toFixed(0)}%
                </span>{" "}
                dari total pengeluaran periode ini.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top products + Stock monitoring */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3 border-border/60 bg-card shadow-warm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Top 5 Barang Terlaris</CardTitle>
              <p className="text-xs text-muted-foreground">Berdasarkan jumlah transaksi periode ini</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {data.topProducts.map((p) => (
                  <div key={p.sku} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-crema font-display text-sm font-semibold text-primary-foreground shadow-warm">
                      {p.rank}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
                      <Coffee className="h-4 w-4 text-bean" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · {p.kg} kg terjual</p>
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
              {data.stok.map((s) => {
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
                      <span>{s.stok} kg / {s.kapasitas} kg</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

      </main>
    </>
  );
}
