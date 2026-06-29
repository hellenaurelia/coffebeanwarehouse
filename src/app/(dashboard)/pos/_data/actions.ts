"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PaymentMethod, BeanType } from "@prisma/client";
import { requireUser } from "@/lib/auth/session";
import { nextDocNumber } from "@/lib/docnumber";

async function resolveCashierId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

const PAY_MAP: Record<string, PaymentMethod> = {
  cash: "CASH",
  qris: "QRIS",
  card: "CARD",
};

export type CheckoutLine = {
  productId: string;
  qty: number;
  sellPrice: number;
  grindOption: "whole" | "ground"; // ← TAMBAHAN
};

export type CheckoutInput = {
  lines: CheckoutLine[];
  payMethod: "cash" | "qris" | "card";
  total: number;
};

export type CheckoutResult = {
  ok: boolean;
  trxNumber?: string;
  error?: string;
};

// Map UI grind option → Prisma BeanType enum
const BEAN_TYPE_MAP: Record<"whole" | "ground", BeanType> = {
  whole: "WHOLE_BEAN",
  ground: "GROUND",
};

export async function checkoutAction(
  input: CheckoutInput
): Promise<CheckoutResult> {
  if (!input.lines || input.lines.length === 0) {
    return { ok: false, error: "Keranjang kosong." };
  }

  const cashierId = await resolveCashierId();
  const paymentMethod = PAY_MAP[input.payMethod];

  if (!paymentMethod) {
    return { ok: false, error: "Metode pembayaran tidak valid." };
  }

  try {
    const result: string = await prisma.$transaction(async (tx): Promise<string> => {
      const trxNumber = await nextDocNumber("TRX", async (datePrefix) => {
        const last = await tx.transaction.findFirst({
          where: { trxNumber: { startsWith: datePrefix } },
          orderBy: { trxNumber: "desc" },
          select: { trxNumber: true },
        });
        return last?.trxNumber ?? null;
      });

      let totalCogs = 0;
      let grossProfit = 0;

      const itemsData: {
        productId: string;
        qtyKg: number;
        sellPricePerKg: number;
        buyPricePerKg: number;
        subtotal: number;
        profit: number;
        beanType: BeanType; // ← TAMBAHAN
      }[] = [];

      const stockMovements: {
        productId: string;
        before: number;
        after: number;
        qty: number;
      }[] = [];

      for (const line of input.lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: {
            id: true,
            stockKg: true,
            supplierProducts: {
              where: { isActive: true },
              orderBy: { createdAt: "asc" },
              take: 1,
              select: { buyPricePerKg: true },
            },
          },
        });

        if (!product) {
          throw new Error("Produk dalam keranjang tidak ditemukan.");
        }

        if (product.stockKg < line.qty) {
          throw new Error(`Stok tidak cukup (tersisa ${product.stockKg} kg).`);
        }

        const buyPrice = product.supplierProducts[0]?.buyPricePerKg ?? 0;
        const subtotal = line.sellPrice * line.qty;
        const profit = (line.sellPrice - buyPrice) * line.qty;

        totalCogs += buyPrice * line.qty;
        grossProfit += profit;

        itemsData.push({
          productId: product.id,
          qtyKg: line.qty,
          sellPricePerKg: line.sellPrice,
          buyPricePerKg: buyPrice,
          subtotal,
          profit,
          beanType: BEAN_TYPE_MAP[line.grindOption], // ← TAMBAHAN
        });

        stockMovements.push({
          productId: product.id,
          before: product.stockKg,
          after: product.stockKg - line.qty,
          qty: line.qty,
        });
      }

      const trx = await tx.transaction.create({
        data: {
          trxNumber,
          paymentMethod,
          status: "PAID",
          totalAmount: input.total,
          totalCogs,
          grossProfit,
          cashierId,
          paidAt: new Date(),
          items: { create: itemsData },
        },
      });

      for (const movement of stockMovements) {
        await tx.product.update({
          where: { id: movement.productId },
          data: { stockKg: movement.after },
        });

        await tx.stockLog.create({
          data: {
            productId: movement.productId,
            type: "SALE",
            qtyChange: -movement.qty,
            qtyBefore: movement.before,
            qtyAfter: movement.after,
            referenceId: trx.id,
            referenceType: "Transaction",
            note: `Penjualan ${trx.trxNumber}`,
            createdById: cashierId,
          },
        });
      }

      return trx.trxNumber;
    });

    revalidatePath("/pos");
    revalidatePath("/transactions");
    revalidatePath("/reports");
    revalidatePath("/inventory");
    revalidatePath("/");

    return { ok: true, trxNumber: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal memproses transaksi.",
    };
  }
}