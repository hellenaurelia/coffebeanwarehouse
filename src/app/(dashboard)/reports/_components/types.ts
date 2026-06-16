export type DateRange = { from: Date | null; to: Date | null };

export type StockStatus = "Aman" | "Menipis" | "Kritis";

export interface SalesData {
  day: string;
  penjualan: number;
  pengeluaran: number;
}

export interface ExpenseData {
  kategori: string;
  nominal: number;
}

export interface TopProductData {
  rank: number;
  name: string;
  sku: string;
  terjual: number;
  kg: number;
  omzet: number;
}

export interface StockData {
  name: string;
  stok: number;
  kapasitas: number;
  status: StockStatus;
}

export interface DashboardData {
  label: string;
  sales: SalesData[];
  expense: ExpenseData[];
  topProducts: TopProductData[];
  stok: StockData[];
  pendapatanTrend: string;
  pengeluaranTrend: string;
  stokKg: string;
  kritisCount: number;
  /** Total pendapatan periode sebelumnya (diisi saat custom range aktif) */
  prevPendapatan?: number;
  /** Total pengeluaran periode sebelumnya (diisi saat custom range aktif) */
  prevPengeluaran?: number;
}

export interface DataByRange {
  "7H": DashboardData;
  "30H": DashboardData;
  "90H": DashboardData;
}