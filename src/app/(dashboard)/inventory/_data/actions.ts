"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";

const INVENTORY_PATH = "/inventory";

async function resolveActorId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

export async function updateProductPriceAction(
  sku: string,
  sellPrice: number
): Promise<void> {
  const actorId = await resolveActorId();

  const updated = await prisma.product.update({
    where: { sku },
    data: { sellPrice },
    select: { id: true },
  });

  await logActivity({
    actorId,
    action: "PRODUCT_PRICE_UPDATE",
    entityType: "Product",
    entityId: updated.id,
    payload: { sku, sellPrice },
  });

  revalidatePath(INVENTORY_PATH);
}

export type ReconLine = {
  sku: string;
  physicalQty: number;
  reason: string;
};

export async function reconcileStockAction(lines: ReconLine[]): Promise<void> {
  if (lines.length === 0) return;
  const actorId = await resolveActorId();

  const applied: { sku: string; before: number; after: number; difference: number }[] = [];

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

      applied.push({ sku: line.sku, before, after, difference });
    }
  });

  if (applied.length > 0) {
    await logActivity({
      actorId,
      action: "STOCK_RECONCILE",
      entityType: "StockReconciliation",
      payload: { lines: applied },
    });
  }

  revalidatePath(INVENTORY_PATH);
}