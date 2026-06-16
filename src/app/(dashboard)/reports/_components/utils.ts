import { StockStatus, DashboardData } from "./types";
import { dataByRange } from "./data";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Number Formatting ────────────────────────────────────────────────────

/** Format ke Rupiah penuh: 4120000 → "Rp 4.120.000" */
export function fmt(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

export const fmtK = fmt;

// ─── Date Utilities ───────────────────────────────────────────────────────

export function isDateInRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return true;
  const [startDate, endDate] = from <= to ? [from, to] : [to, from];
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return dateOnly >= startOnly && dateOnly <= endOnly;
}

export function getDatesInRange(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const [from, to] = start <= end ? [start, end] : [end, start];
  const current = new Date(from);
  while (current <= to) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isSameDate(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatDateID(date: Date, format: "short" | "long" = "short"): string {
  const day = date.getDate();
  const month = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ][date.getMonth()];
  const year = date.getFullYear();
  if (format === "short") return `${day} ${month.slice(0, 3)}`;
  return `${day} ${month} ${year}`;
}

// ─── Trend Calculation ────────────────────────────────────────────────────

/** Hitung persentase perubahan dari nilai lama ke nilai baru */
export function calcTrend(current: number, previous: number): string {
  if (previous === 0) return "+0,0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

// ─── Core Data Generator ──────────────────────────────────────────────────

/**
 * Hitung total penjualan & pengeluaran untuk range tertentu,
 * di-scale dari dataset referensi terdekat.
 */
function calcTotalsForRange(totalDays: number): { penjualan: number; pengeluaran: number } {
  let refKey: "7H" | "30H" | "90H";
  let refDays: number;
  if (totalDays <= 14) { refKey = "7H"; refDays = 7; }
  else if (totalDays <= 60) { refKey = "30H"; refDays = 30; }
  else { refKey = "90H"; refDays = 90; }

  const ref = dataByRange[refKey];
  const ratio = totalDays / refDays;

  return {
    penjualan: ref.sales.reduce((s, d) => s + d.penjualan, 0) * ratio,
    pengeluaran: ref.expense.reduce((s, d) => s + d.nominal, 0) * ratio,
  };
}

/**
 * Generate data dashboard untuk custom date range.
 * Trend dihitung dengan membandingkan vs periode sebelumnya (durasi sama).
 */
export function generateDataForRange(from: Date, to: Date): DashboardData {
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / msPerDay) + 1);

  // Periode sebelumnya: durasi sama, langsung sebelum `from`
  const prevTo = new Date(from.getTime() - msPerDay);
  const prevFrom = new Date(prevTo.getTime() - (totalDays - 1) * msPerDay);
  const prevTotalDays = Math.max(1, Math.round((prevTo.getTime() - prevFrom.getTime()) / msPerDay) + 1);

  const current = calcTotalsForRange(totalDays);
  const previous = calcTotalsForRange(prevTotalDays);

  const pendapatanTrend = calcTrend(current.penjualan, previous.penjualan);
  const pengeluaranTrend = calcTrend(current.pengeluaran, previous.pengeluaran);

  // Pilih referensi dataset
  let refKey: "7H" | "30H" | "90H";
  let refDays: number;
  if (totalDays <= 14) { refKey = "7H"; refDays = 7; }
  else if (totalDays <= 60) { refKey = "30H"; refDays = 30; }
  else { refKey = "90H"; refDays = 90; }

  const ref = dataByRange[refKey];
  const ratio = totalDays / refDays;

  const scaledExpense = ref.expense.map((e) => ({
    kategori: e.kategori,
    nominal: Math.round(e.nominal * ratio),
  }));

  const scaledTopProducts = ref.topProducts.map((p) => ({
    ...p,
    terjual: Math.round(p.terjual * ratio),
    kg: Math.round(p.kg * ratio * 10) / 10,
    omzet: Math.round(p.omzet * ratio),
  }));

  const scaledSales = generateSalesSegments(from, to, totalDays, ref, ratio);

  return {
    label: `${formatDateID(from, "long")} – ${formatDateID(to, "long")}`,
    sales: scaledSales,
    expense: scaledExpense,
    topProducts: scaledTopProducts,
    stok: ref.stok as DashboardData["stok"],
    pendapatanTrend,
    pengeluaranTrend,
    prevPendapatan: Math.round(previous.penjualan),
    prevPengeluaran: Math.round(previous.pengeluaran),
    stokKg: ref.stokKg,
    kritisCount: ref.kritisCount,
  };
}

function generateSalesSegments(
  from: Date,
  to: Date,
  totalDays: number,
  ref: (typeof dataByRange)["7H" | "30H" | "90H"],
  ratio: number
): { day: string; penjualan: number; pengeluaran: number }[] {
  const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  if (totalDays <= 14) {
    const totalPenjualan = ref.sales.reduce((s, d) => s + d.penjualan, 0);
    const totalPengeluaran = ref.sales.reduce((s, d) => s + d.pengeluaran, 0);
    const dailyP = totalPenjualan / 7;
    const dailyE = totalPengeluaran / 7;
    const result = [];
    const cur = new Date(from);
    while (cur <= to) {
      const dow = cur.getDay();
      const m = dow === 0 || dow === 6 ? 1.35 : 1.0;
      result.push({
        day: DAYS_SHORT[dow],
        penjualan: Math.round(dailyP * m),
        pengeluaran: Math.round(dailyE * m * 0.38),
      });
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  }

  if (totalDays <= 60) {
    const weeks = Math.ceil(totalDays / 7);
    const totalP = ref.sales.reduce((s, d) => s + d.penjualan, 0) * ratio;
    const totalE = ref.sales.reduce((s, d) => s + d.pengeluaran, 0) * ratio;
    return Array.from({ length: weeks }, (_, i) => ({
      day: `M${i + 1}`,
      penjualan: Math.round((totalP / weeks) * (0.9 + (i % 3) * 0.08)),
      pengeluaran: Math.round((totalE / weeks) * (0.9 + (i % 3) * 0.08)),
    }));
  }

  // Per bulan
  const months: Record<string, { penjualan: number; pengeluaran: number }> = {};
  const totalP = ref.sales.reduce((s, d) => s + d.penjualan, 0) * ratio;
  const totalE = ref.sales.reduce((s, d) => s + d.pengeluaran, 0) * ratio;
  const dailyP = totalP / totalDays;
  const dailyE = totalE / totalDays;
  const cur = new Date(from);
  while (cur <= to) {
    const key = MONTHS_SHORT[cur.getMonth()];
    if (!months[key]) months[key] = { penjualan: 0, pengeluaran: 0 };
    months[key].penjualan += dailyP;
    months[key].pengeluaran += dailyE;
    cur.setDate(cur.getDate() + 1);
  }
  return Object.entries(months).map(([day, vals]) => ({
    day,
    penjualan: Math.round(vals.penjualan),
    pengeluaran: Math.round(vals.pengeluaran),
  }));
}

// ─── Stock Status Styling ─────────────────────────────────────────────────

export function statusTone(status: StockStatus): string {
  switch (status) {
    case "Aman":    return "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400";
    case "Menipis": return "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400";
    case "Kritis":  return "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400";
    default:        return "";
  }
}

// ─── PDF Export ───────────────────────────────────────────────────────────

export interface PDFExportOptions {
  title: string;
  fileName: string;
  tableData: { headers: string[]; rows: (string | number)[][] };
  summaryData?: { label: string; value: string }[];
}

export function exportToPDF({ title, fileName, tableData, summaryData }: PDFExportOptions): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 15;

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text(title, margin, margin + 10);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(128);
  doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, margin, margin + 16);

  let yPosition = margin + 25;
  if (summaryData?.length) {
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0);
    doc.text("Ringkasan:", margin, yPosition);
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    for (const item of summaryData) {
      doc.text(`${item.label}: ${item.value}`, margin + 5, yPosition);
      yPosition += 5;
    }
    yPosition += 3;
  }

  autoTable(doc, {
    startY: yPosition,
    head: [tableData.headers],
    body: tableData.rows,
    margin: { left: margin, right: margin, top: yPosition, bottom: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [101, 67, 33], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(fileName);
}