"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";

const INVENTORY_PATH = "/inventory";

async function resolveActorId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

// ============================================================================
// PRODUCT: update sell price (the only persistent field the detail/edit modal
// changes; SKU/supplier/type/stock/cost are read-only there).
// NOTE: photo has no column in the schema, so it is not persisted.
// ============================================================================
export async function updateProductPriceAction(
  sku: string,
  sellPrice: number
): Promise<void> {
  await prisma.product.update({
    where: { sku },
    data: { sellPrice },
  });
  revalidatePath(INVENTORY_PATH);
}

// ============================================================================
// STOCK RECONCILIATION: apply physical counts.
// Receives only the lines that actually changed, each with the new physical
// quantity and a reason. Per line we: update stock, write a StockReconciliation
// record, and write a StockLog (type RECONCILIATION) — all in one transaction.
// ============================================================================
export type ReconLine = {
  sku: string;
  physicalQty: number;
  reason: string;
};

export async function reconcileStockAction(lines: ReconLine[]): Promise<void> {
  if (lines.length === 0) return;
  const actorId = await resolveActorId();

  await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const product = await tx.product.findUnique({
        where: { sku: line.sku },
        select: { id: true, stockKg: true },
      });
      if (!product) continue;

      const before = product.stockKg;
      const after = line.physicalQty;
      const difference = after - before;

      // No real change -> skip writing records.
      if (difference === 0) continue;

      await tx.product.update({
        where: { id: product.id },
        data: { stockKg: after },
      });

      await tx.stockReconciliation.create({
        data: {
          productId: product.id,
          systemQty: before,
          physicalQty: after,
          difference,
          reason: line.reason?.trim() || "Penyesuaian stok fisik",
          createdById: actorId,
        },
      });

      await tx.stockLog.create({
        data: {
          productId: product.id,
          type: "RECONCILIATION",
          qtyChange: difference,
          qtyBefore: before,
          qtyAfter: after,
          referenceType: "StockReconciliation",
          note: line.reason?.trim() || "Penyesuaian stok fisik",
          createdById: actorId,
        },
      });
    }
  });

  revalidatePath(INVENTORY_PATH);
}
