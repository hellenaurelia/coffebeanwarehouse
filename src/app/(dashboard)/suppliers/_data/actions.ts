"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  poStatusToDb,
  supplierIsActiveFromUi,
  mapSupplier,
  mapPO,
  type DbSupplierRow,
  type DbPORow,
} from "./mappers";
import type { Supplier, PO } from "../lib";

const SUPPLIERS_PATH = "/suppliers";
const INVENTORY_PATH = "/inventory";

async function resolveActorId(): Promise<string> {
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER", isActive: true },
    select: { id: true },
  });
  if (owner) return owner.id;
  const any = await prisma.user.findFirst({ select: { id: true } });
  if (!any) throw new Error("Tidak ada user di database untuk dijadikan creator.");
  return any.id;
}

const supplierSelect = {
  id: true,
  supplierCode: true,
  name: true,
  picName: true,
  region: true,
  phone: true,
  email: true,
  address: true,
  notes: true,
  isActive: true,
  supplierProducts: {
    select: {
      buyPricePerKg: true,
      isActive: true,
      product: { select: { name: true, variety: true } },
    },
  },
  purchaseOrders: {
    select: {
      status: true,
      receivedAt: true,
      items: { select: { qtyKg: true } },
    },
  },
} as const;

// ============================================================================
// SUPPLIER: create / update
// ============================================================================
export async function saveSupplierAction(
  data: Omit<Supplier, "id" | "code"> & { id?: string; code?: string }
): Promise<Supplier> {
  const actorId = await resolveActorId();
  const isActive = supplierIsActiveFromUi(data.status);

  const base = {
    name: data.name,
    picName: data.pic,
    region: data.region,
    phone: data.phone,
    email: data.email || null,
    address: data.address ?? null,
    notes: data.notes ?? null,
    isActive,
  };

  let supplierId: string;

  if (data.id) {
    // Update existing
    await prisma.supplier.update({ where: { id: data.id }, data: base });
    supplierId = data.id;
  } else {
    const created = await prisma.$transaction(async (tx) => {
      const last = await tx.supplier.findFirst({
        where: { supplierCode: { startsWith: "S-" } },
        orderBy: { supplierCode: "desc" },
        select: { supplierCode: true },
      });
      const lastNum = last
        ? parseInt(last.supplierCode.slice(2), 10) || 0
        : 0;
      const supplierCode = `S-${String(lastNum + 1).padStart(3, "0")}`;

      return tx.supplier.create({
        data: { ...base, supplierCode, createdById: actorId },
        select: { id: true },
      });
    });
    supplierId = created.id;
  }

  const beanNames = data.beans.map((b) => b.name);

  const products = await prisma.product.findMany({
    where: { name: { in: beanNames } },
    select: { id: true, name: true },
  });
  const productByName = new Map(products.map((p) => [p.name, p.id]));

  const existingLinks = await prisma.supplierProduct.findMany({
    where: { supplierId },
    select: { id: true, productId: true },
  });
  const linkByProductId = new Map(existingLinks.map((l) => [l.productId, l.id]));

  // Bean rows currently in the form (that resolve to a real product).
  const keptProductIds = new Set<string>();

  for (const bean of data.beans) {
    const productId = productByName.get(bean.name);
    if (!productId) continue;
    keptProductIds.add(productId);

    // Persist the variety on the product itself (variety belongs to the
    // product, not to the supplier link — keeps it consistent across
    // suppliers selling the same bean name).
    if (bean.type) {
      await prisma.product.update({
        where: { id: productId },
        data: { variety: bean.type },
      });
    }

    const existingLinkId = linkByProductId.get(productId);
    if (existingLinkId) {
      await prisma.supplierProduct.update({
        where: { id: existingLinkId },
        data: { buyPricePerKg: bean.price, isActive: bean.active ?? true },
      });
    } else {
      await prisma.supplierProduct.create({
        data: {
          supplierId,
          productId,
          buyPricePerKg: bean.price,
          isActive: bean.active ?? true,
        },
      });
    }
  }

  const linkIdsToRemove = existingLinks
    .filter((l) => !keptProductIds.has(l.productId))
    .map((l) => l.id);

  if (linkIdsToRemove.length > 0) {
    await prisma.supplierProduct.deleteMany({
      where: { id: { in: linkIdsToRemove } },
    });
  }

  const row = await prisma.supplier.findUniqueOrThrow({
    where: { id: supplierId },
    select: supplierSelect,
  });

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
  return mapSupplier(row as DbSupplierRow);
}

export async function deleteSupplierAction(id: string): Promise<void> {
  // Mark as deleted — separate flag from isActive.
  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // Products this supplier was linked to.
  const links = await prisma.supplierProduct.findMany({
    where: { supplierId: id },
    select: { productId: true },
  });
  const productIds = [...new Set(links.map((l) => l.productId))];

  if (productIds.length === 0) {
    revalidatePath(SUPPLIERS_PATH);
    revalidatePath(INVENTORY_PATH);
    return;
  }

  const stillActiveLinks = await prisma.supplierProduct.findMany({
    where: {
      productId: { in: productIds },
      supplierId: { not: id },
      isActive: true,
      supplier: { isActive: true, deletedAt: null },
    },
    select: { productId: true },
  });
  const stillSuppliedIds = new Set(stillActiveLinks.map((l) => l.productId));

  const productIdsToDeactivate = productIds.filter(
    (pid) => !stillSuppliedIds.has(pid)
  );

  if (productIdsToDeactivate.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: productIdsToDeactivate } },
      data: { isActive: false },
    });
  }

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
}

// ============================================================================
// PURCHASE ORDER: create
// ============================================================================
export async function savePOAction(
  partial: Omit<PO, "id">
): Promise<PO> {
  const actorId = await resolveActorId();

  // Generate next PO number: PO-#### based on current max.
  const last = await prisma.purchaseOrder.findFirst({
    orderBy: { poNumber: "desc" },
    select: { poNumber: true },
  });
  const lastNum = last ? parseInt(last.poNumber.replace(/\D/g, ""), 10) || 0 : 0;
  const poNumber = `PO-${String(lastNum + 1).padStart(4, "0")}`;

  // Resolve products by bean name for each line item.
  const itemsData = [];
  let totalAmount = 0;
  for (const it of partial.items) {
    const product = await prisma.product.findFirst({
      where: { name: it.bean },
      select: { id: true },
    });
    if (!product) {
      throw new Error(`Produk "${it.bean}" tidak ditemukan di database.`);
    }

    const existingLink = await prisma.supplierProduct.findFirst({
      where: { supplierId: partial.supplierId, productId: product.id },
      select: { id: true, isActive: true },
    });
    if (!existingLink) {
      await prisma.supplierProduct.create({
        data: {
          supplierId: partial.supplierId,
          productId: product.id,
          buyPricePerKg: it.pricePerKg,
          isActive: true,
        },
      });
    } else if (!existingLink.isActive) {
      await prisma.supplierProduct.update({
        where: { id: existingLink.id },
        data: { isActive: true },
      });
    }

    const subtotal = it.qty * it.pricePerKg;
    totalAmount += subtotal;
    itemsData.push({
      productId: product.id,
      qtyKg: it.qty,
      buyPricePerKg: it.pricePerKg,
      subtotal,
    });
  }

  const created = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: partial.supplierId,
      status: poStatusToDb(partial.status),
      totalAmount,
      notes: partial.notes || null,
      createdById: actorId,
      items: { create: itemsData },
    },
    select: poDetailSelect,
  });

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
  return mapPO(created as DbPORow);
}

const poDetailSelect = {
  id: true,
  poNumber: true,
  status: true,
  notes: true,
  receivedAt: true,
  createdAt: true,
  supplierId: true,
  supplier: { select: { name: true } },
  createdBy: { select: { name: true } },
  items: {
    select: {
      qtyKg: true,
      buyPricePerKg: true,
      product: { select: { name: true } },
    },
  },
} as const;

// ============================================================================
// PURCHASE ORDER: update status (and stock-in when received)
// ============================================================================
export async function updatePOStatusAction(
  poNumber: string,
  newStatus: PO["status"]
): Promise<void> {
  const dbStatus = poStatusToDb(newStatus);

  const po = await prisma.purchaseOrder.findUnique({
    where: { poNumber },
    select: {
      id: true,
      status: true,
      receivedAt: true,
      createdById: true,
      items: { select: { productId: true, qtyKg: true } },
    },
  });
  if (!po) throw new Error(`PO ${poNumber} tidak ditemukan.`);

  const becomingReceived = dbStatus === "DITERIMA" && po.status !== "DITERIMA";

  await prisma.$transaction(async (tx) => {
    await tx.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: dbStatus,
        receivedAt:
          dbStatus === "DITERIMA" ? po.receivedAt ?? new Date() : po.receivedAt,
      },
    });

    // When a PO transitions to DITERIMA, add stock + write stock logs.
    if (becomingReceived) {
      for (const item of po.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { stockKg: true },
        });
        const before = product.stockKg;
        const after = before + item.qtyKg;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockKg: after },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: "PO_IN",
            qtyChange: item.qtyKg,
            qtyBefore: before,
            qtyAfter: after,
            referenceId: po.id,
            referenceType: "PurchaseOrder",
            note: `Penerimaan PO ${poNumber}`,
            createdById: po.createdById,
          },
        });
      }
    }
  });

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
}

// ============================================================================
// PURCHASE ORDER: update arrival date
// ============================================================================
export async function updatePOArrivalAction(
  poNumber: string,
  dateLabel: string
): Promise<void> {
  // The UI passes a date string. Parse common forms; fall back to now.
  const parsed = parseUiDate(dateLabel);
  await prisma.purchaseOrder.update({
    where: { poNumber },
    data: { receivedAt: parsed },
  });
  revalidatePath(SUPPLIERS_PATH);
}

// ============================================================================
// SUPPLIER BEAN: toggle active
// ============================================================================
export async function toggleBeanAction(
  supplierId: string,
  beanName: string
): Promise<void> {
  const product = await prisma.product.findFirst({
    where: { name: beanName },
    select: { id: true },
  });
  if (!product) return;

  const sp = await prisma.supplierProduct.findFirst({
    where: { supplierId, productId: product.id },
    select: { id: true, isActive: true },
  });
  if (!sp) return;

  await prisma.supplierProduct.update({
    where: { id: sp.id },
    data: { isActive: !sp.isActive },
  });
  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
}

// --- helpers ----------------------------------------------------------------
function parseUiDate(label: string): Date | null {
  if (!label || label === "-") return null;
  // Try native parse first (handles yyyy-mm-dd from <input type=date>)
  const native = new Date(label);
  if (!isNaN(native.getTime())) return native;
  return new Date();
}