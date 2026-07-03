// Server-only read layer for Transactions.

import { prisma } from "@/lib/prisma";
import type { Trx, Method } from "../types";

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const METHOD_MAP: Record<string, Method> = {
  CASH: "Cash",
  QRIS: "QRIS",
  CARD: "Kartu",
};

function fmtTanggal(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const month = Number(get("month")) - 1;
  return `${get("day")} ${ID_MONTHS_SHORT[month]} ${get("year")}`;
}

function fmtWaktu(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
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
          beanType: true, // ← TAMBAHAN
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
        grind: it.beanType === "GROUND" ? "ground" : "whole",
      })),
    } satisfies Trx;
  });
}