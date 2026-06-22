// Server-only read layer for Transactions.
// Maps Transaction rows into the UI Trx shape declared in transactions/types.ts.

import { prisma } from "@/lib/prisma";
import type { Trx, Method } from "../types";

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// DB enum -> UI Method label. Note the UI uses "Kartu" (not "Card").
const METHOD_MAP: Record<string, Method> = {
  CASH: "Cash",
  QRIS: "QRIS",
  CARD: "Kartu",
};

// "9 Mei 2026" — the format transactions/lib.ts parseDate() expects.
function fmtTanggal(d: Date): string {
  return `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtWaktu(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function getTransactions(): Promise<Trx[]> {
  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      trxNumber: true,
      paymentMethod: true,
      totalAmount: true,
      paidAt: true,
      createdAt: true,
      cashier: { select: { name: true } },
      items: {
        select: {
          qtyKg: true,
          sellPricePerKg: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((t) => {
    const when = t.paidAt ?? t.createdAt;
    return {
      id: t.trxNumber,
      date: fmtTanggal(when),
      time: fmtWaktu(when),
      cashier: t.cashier.name,
      items: t.items.length,
      total: t.totalAmount,
      method: METHOD_MAP[t.paymentMethod] ?? "QRIS",
      detail: t.items.map((it) => ({
        name: it.product.name,
        qty: it.qtyKg,
        price: it.sellPricePerKg,
      })),
    } satisfies Trx;
  });
}
