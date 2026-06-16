import { DataByRange } from "./types";

// ─── Calendar Months & Days ───────────────────────────────────────────────

export const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ─── Dashboard Data ───────────────────────────────────────────────────────

export const dataByRange = {
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
      {
        rank: 1,
        name: "Arabica Gayo Wine",
        sku: "ARB-GYW-250",
        terjual: 142,
        kg: 35.5,
        omzet: 17_750_000,
      },
      {
        rank: 2,
        name: "Robusta Lampung AP-1",
        sku: "ROB-LPG-500",
        terjual: 128,
        kg: 64,
        omzet: 11_520_000,
      },
      {
        rank: 3,
        name: "Arabica Toraja Sapan",
        sku: "ARB-TRJ-250",
        terjual: 96,
        kg: 24,
        omzet: 14_400_000,
      },
      {
        rank: 4,
        name: "Luwak Liar Bali Kintamani",
        sku: "LWK-BLI-100",
        terjual: 54,
        kg: 5.4,
        omzet: 21_600_000,
      },
      {
        rank: 5,
        name: "Liberica Jambi Tungkal",
        sku: "LBR-JMB-250",
        terjual: 47,
        kg: 11.75,
        omzet: 5_405_000,
      },
    ],
    stok: [
      {
        name: "Arabica Gayo Wine",
        stok: 38,
        kapasitas: 80,
        status: "Aman" as const,
      },
      {
        name: "Robusta Lampung AP-1",
        stok: 124,
        kapasitas: 200,
        status: "Aman" as const,
      },
      {
        name: "Arabica Toraja Sapan",
        stok: 22,
        kapasitas: 80,
        status: "Menipis" as const,
      },
      {
        name: "Luwak Liar Bali Kintamani",
        stok: 4,
        kapasitas: 20,
        status: "Kritis" as const,
      },
      {
        name: "Liberica Jambi Tungkal",
        stok: 61,
        kapasitas: 120,
        status: "Aman" as const,
      },
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
      {
        rank: 1,
        name: "Arabica Gayo Wine",
        sku: "ARB-GYW-250",
        terjual: 540,
        kg: 135,
        omzet: 67_500_000,
      },
      {
        rank: 2,
        name: "Robusta Lampung AP-1",
        sku: "ROB-LPG-500",
        terjual: 498,
        kg: 249,
        omzet: 44_820_000,
      },
      {
        rank: 3,
        name: "Luwak Liar Bali Kintamani",
        sku: "LWK-BLI-100",
        terjual: 210,
        kg: 21,
        omzet: 84_000_000,
      },
      {
        rank: 4,
        name: "Arabica Toraja Sapan",
        sku: "ARB-TRJ-250",
        terjual: 380,
        kg: 95,
        omzet: 57_000_000,
      },
      {
        rank: 5,
        name: "Liberica Jambi Tungkal",
        sku: "LBR-JMB-250",
        terjual: 183,
        kg: 45.75,
        omzet: 21_045_000,
      },
    ],
    stok: [
      {
        name: "Arabica Gayo Wine",
        stok: 38,
        kapasitas: 80,
        status: "Aman" as const,
      },
      {
        name: "Robusta Lampung AP-1",
        stok: 124,
        kapasitas: 200,
        status: "Aman" as const,
      },
      {
        name: "Arabica Toraja Sapan",
        stok: 22,
        kapasitas: 80,
        status: "Menipis" as const,
      },
      {
        name: "Luwak Liar Bali Kintamani",
        stok: 4,
        kapasitas: 20,
        status: "Kritis" as const,
      },
      {
        name: "Liberica Jambi Tungkal",
        stok: 61,
        kapasitas: 120,
        status: "Aman" as const,
      },
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
      {
        rank: 1,
        name: "Arabica Gayo Wine",
        sku: "ARB-GYW-250",
        terjual: 1620,
        kg: 405,
        omzet: 202_500_000,
      },
      {
        rank: 2,
        name: "Robusta Lampung AP-1",
        sku: "ROB-LPG-500",
        terjual: 1490,
        kg: 745,
        omzet: 134_100_000,
      },
      {
        rank: 3,
        name: "Luwak Liar Bali Kintamani",
        sku: "LWK-BLI-100",
        terjual: 630,
        kg: 63,
        omzet: 252_000_000,
      },
      {
        rank: 4,
        name: "Arabica Toraja Sapan",
        sku: "ARB-TRJ-250",
        terjual: 1140,
        kg: 285,
        omzet: 171_000_000,
      },
      {
        rank: 5,
        name: "Liberica Jambi Tungkal",
        sku: "LBR-JMB-250",
        terjual: 549,
        kg: 137.25,
        omzet: 63_135_000,
      },
    ],
    stok: [
      {
        name: "Arabica Gayo Wine",
        stok: 38,
        kapasitas: 80,
        status: "Aman" as const,
      },
      {
        name: "Robusta Lampung AP-1",
        stok: 124,
        kapasitas: 200,
        status: "Aman" as const,
      },
      {
        name: "Arabica Toraja Sapan",
        stok: 22,
        kapasitas: 80,
        status: "Menipis" as const,
      },
      {
        name: "Luwak Liar Bali Kintamani",
        stok: 4,
        kapasitas: 20,
        status: "Kritis" as const,
      },
      {
        name: "Liberica Jambi Tungkal",
        stok: 61,
        kapasitas: 120,
        status: "Aman" as const,
      },
    ],
    pendapatanTrend: "+18,9%",
    pengeluaranTrend: "+6,3%",
    stokKg: "249 kg",
    kritisCount: 2,
  },
} as const satisfies DataByRange;

// ─── Chart Config ───────────────────────────────────────────────────────

export const chartConfig = {
  penjualan: {
    label: "Penjualan",
    color: "var(--color-bean)",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "var(--color-roast)",
  },
} as const;