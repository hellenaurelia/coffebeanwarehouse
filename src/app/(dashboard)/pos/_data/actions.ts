"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@prisma/client";
import { requireUser } from "@/lib/auth/session";

// The cashier is whoever is logged in.
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
  productId: string; // real DB product id (POS catalog uses it as the key)
  qty: number;       // in kg (may be fractional)
  sellPrice: number; // unit sell price shown at checkout
};

export type CheckoutInput = {
  lines: CheckoutLine[];
  payMethod: "cash" | "qris" | "card";
  // The exact total the customer paid (subtotal − discount + tax + grind fees),
  // persisted as totalAmount so the record matches the receipt.
  total: number;
};

export type CheckoutResult = {
  ok: boolean;
  trxNumber?: string;
  error?: string;
};

export async function checkoutAction(
  input: CheckoutInput
): Promise<CheckoutResult> {
  if (!input.lines || input.lines.length === 0) {
    return {
      ok: false,
      error: "Keranjang kosong.",
    };
  }

  const cashierId = await resolveCashierId();

  const paymentMethod = PAY_MAP[input.payMethod];

  if (!paymentMethod) {
    return {
      ok: false,
      error: "Metode pembayaran tidak valid.",
    };
  }

  try {
    const result: string = await prisma.$transaction(async (tx): Promise<string> => {
      const last = await tx.transaction.findFirst({
        orderBy: {
          trxNumber: "desc",
        },
        select: {
          trxNumber: true,
        },
      });

      const lastNum = last
        ? parseInt(last.trxNumber.replace(/\D/g, ""), 10) || 0
        : 0;

      const trxNumber = `TRX-${String(lastNum + 1).padStart(4, "0")}`;

      let totalCogs = 0;
      let grossProfit = 0;

      const itemsData: {
        productId: string;
        qtyKg: number;
        sellPricePerKg: number;
        buyPricePerKg: number;
        subtotal: number;
        profit: number;
      }[] = [];

      const stockMovements: {
        productId: string;
        before: number;
        after: number;
        qty: number;
      }[] = [];

      for (const line of input.lines) {
        const product = await tx.product.findUnique({
          where: {
            id: line.productId,
          },
          select: {
            id: true,
            stockKg: true,
            supplierProducts: {
              where: {
                isActive: true,
              },
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              select: {
                buyPricePerKg: true,
              },
            },
          },
        });

        if (!product) {
          throw new Error(
            "Produk dalam keranjang tidak ditemukan."
          );
        }

        if (product.stockKg < line.qty) {
          throw new Error(
            `Stok tidak cukup (tersisa ${product.stockKg} kg).`
          );
        }

        const buyPrice =
          product.supplierProducts[0]?.buyPricePerKg ?? 0;

        const subtotal =
          line.sellPrice * line.qty;

        const profit =
          (line.sellPrice - buyPrice) *
          line.qty;

        totalCogs += buyPrice * line.qty;
        grossProfit += profit;

        itemsData.push({
          productId: product.id,
          qtyKg: line.qty,
          sellPricePerKg: line.sellPrice,
          buyPricePerKg: buyPrice,
          subtotal,
          profit,
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
          items: {
            create: itemsData,
          },
        },
      });

      for (const movement of stockMovements) {
        await tx.product.update({
          where: {
            id: movement.productId,
          },
          data: {
            stockKg: movement.after,
          },
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

    return {
      ok: true,
      trxNumber: result,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Gagal memproses transaksi.",
    };
  }
}