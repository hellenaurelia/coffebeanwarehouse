import { Banknote, CreditCard, QrCode } from "lucide-react";
import type { Method, Trx } from "./types";

export const TAX = 0.11;

export const methodIcon: Record<string, React.ElementType> = {
  Cash: Banknote,
  Kartu: CreditCard,
  QRIS: QrCode,
  Debit: CreditCard,  
  Credit: CreditCard, 
};

export const fmt = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export const ID_MONTHS: Record<string, number> = {
  Jan:0, Feb:1, Mar:2, Apr:3, Mei:4, Jun:5,
  Jul:6, Agu:7, Sep:8, Okt:9, Nov:10, Des:11,
};

export const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export const DAY_NAMES = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export const parseDate = (s: string) => {
  const [d, m, y] = s.split(" ");
  return new Date(+y, ID_MONTHS[m], +d);
};

export const sod = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const sameDay = (a: Date, b: Date) =>
  a.toDateString() === b.toDateString();

export function exportCSV(rows: Trx[]) {
  const lines = [
    "ID,Tanggal,Waktu,Kasir,Item,Total,Metode",
    ...rows.map(t =>
      [t.id, t.date, t.time, t.cashier, t.items, t.total, t.method].join(",")
    ),
  ];
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv" })
    ),
    download: "transaksi.csv",
  });
  a.click();
}