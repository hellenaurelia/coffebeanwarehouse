"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  poStatusToDb,
  supplierIsActiveFromUi,
  mapSupplier,
  mapPO,
  type DbSupplierRow,
  type DbPORow,
} from "./mappers";
import type { Supplier, PO } from "../lib";
import type { Prisma, BeanType } from "@prisma/client";

const SUPPLIERS_PATH = "/suppliers";

// Resolve the authenticated user id for `createdById` on writes.
async function resolveActorId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

// ---------------------------------------------------------------------------
// Activity log helper. Best-effort: never blocks the main write if it fails.
// Pass a `tx` to write inside an existing transaction; otherwise uses prisma.
// ---------------------------------------------------------------------------
async function logActivity(
  client: Prisma.TransactionClient | typeof prisma,
  params: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    payload?: Prisma.InputJsonValue;
  }
): Promise<void> {
  try {
    await client.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        payload: params.payload ?? undefined,
      },
    });
  } catch (err) {
    console.error("Gagal menulis activity log:", err);
  }
}

// ---------------------------------------------------------------------------
// Generate a unique SKU from a product name, e.g. "Gayo Wine Natural" -> GYO-WN-001.
// Falls back to a numeric suffix to guarantee uniqueness.
// ---------------------------------------------------------------------------
async function generateSku(name: string): Promise<string> {
  const words = name.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const prefix =
    words.length >= 2
      ? words[0].slice(0, 3) + "-" + words[1].slice(0, 2)
      : (words[0] ?? "PRD").slice(0, 5);

  for (let i = 1; i < 1000; i++) {
    const candidate = `${prefix}-${String(i).padStart(3, "0")}`;
    const exists = await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  // Extremely unlikely fallback
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

// Map UI bean "type" (Arabica/Robusta/etc) -> DB BeanType enum.
// The DB enum only encodes physical form, so everything defaults to WHOLE_BEAN.
function beanTypeToDb(_uiType: string): BeanType {
  return "WHOLE_BEAN";
}

// ---------------------------------------------------------------------------
// Find a product by case-insensitive name, or create it if missing.
// Returns the product id.
// ---------------------------------------------------------------------------
async function findOrCreateProduct(
  bean: { name: string; price: number; type: string },
  actorId: string
): Promise<string> {
  const existing = await prisma.product.findFirst({
    where: { name: { equals: bean.name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const sku = await generateSku(bean.name);
  const created = await prisma.product.create({
    data: {
      sku,
      name: bean.name,
      type: beanTypeToDb(bean.type),
      sellPrice: 0, // diisi manual nanti di menu produk
      stockKg: 0,
      minStockKg: 25,
      createdById: actorId,
    },
    select: { id: true },
  });
  return created.id;
}

const supplierSelect = {
  id: true,
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
      product: { select: { name: true } },
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
  data: Omit<Supplier, "id"> & { id?: string }
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
  const isUpdate = !!data.id;

  if (data.id) {
    await prisma.supplier.update({ where: { id: data.id }, data: base });
    supplierId = data.id;
  } else {
    const created = await prisma.supplier.create({
      data: { ...base, createdById: actorId },
      select: { id: true },
    });
    supplierId = created.id;
  }

  // Sync beans -> supplierProducts. Products are auto-created if the name is new.
  for (const bean of data.beans) {
    const productId = await findOrCreateProduct(
      { name: bean.name, price: bean.price, type: bean.type },
      actorId
    );

    const existing = await prisma.supplierProduct.findFirst({
      where: { supplierId, productId },
      select: { id: true },
    });

    if (existing) {
      await prisma.supplierProduct.update({
        where: { id: existing.id },
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

  const row = await prisma.supplier.findUniqueOrThrow({
    where: { id: supplierId },
    select: supplierSelect,
  });

  await logActivity(prisma, {
    userId: actorId,
    action: isUpdate ? "UPDATE_SUPPLIER" : "CREATE_SUPPLIER",
    entityType: "Supplier",
    entityId: supplierId,
    payload: { name: data.name, beans: data.beans.length },
  });

  revalidatePath(SUPPLIERS_PATH);
  return mapSupplier(row as DbSupplierRow);
}

// ============================================================================
// SUPPLIER: delete (soft — keeps PO history)
// ============================================================================
export async function deleteSupplierAction(id: string): Promise<void> {
  const actorId = await resolveActorId();

  const s = await prisma.supplier.update({
    where: { id },
    data: { isActive: false },
    select: { name: true },
  });

  await logActivity(prisma, {
    userId: actorId,
    action: "DELETE_SUPPLIER",
    entityType: "Supplier",
    entityId: id,
    payload: { name: s.name },
  });

  revalidatePath(SUPPLIERS_PATH);
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
// PURCHASE ORDER: create
// ============================================================================
export async function savePOAction(partial: Omit<PO, "id">): Promise<PO> {
  const actorId = await resolveActorId();

  // Generate next PO number: PO-#### based on current max.
  const last = await prisma.purchaseOrder.findFirst({
    orderBy: { poNumber: "desc" },
    select: { poNumber: true },
  });
  const lastNum = last ? parseInt(last.poNumber.replace(/\D/g, ""), 10) || 0 : 0;
  const poNumber = `PO-${String(lastNum + 1).padStart(4, "0")}`;

  // Resolve products by bean name (auto-create if missing) for each line item.
  const itemsData = [];
  let totalAmount = 0;
  for (const it of partial.items) {
    const productId = await findOrCreateProduct(
      { name: it.bean, price: it.pricePerKg, type: "" },
      actorId
    );
    const subtotal = it.qty * it.pricePerKg;
    totalAmount += subtotal;
    itemsData.push({
      productId,
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

  await logActivity(prisma, {
    userId: actorId,
    action: "CREATE_PO",
    entityType: "PurchaseOrder",
    entityId: created.id,
    payload: { poNumber, totalAmount, items: itemsData.length },
  });

  revalidatePath(SUPPLIERS_PATH);
  return mapPO(created as DbPORow);
}

// ============================================================================
// PURCHASE ORDER: update status (and stock-in when received)
// ============================================================================
export async function updatePOStatusAction(
  poNumber: string,
  newStatus: PO["status"]
): Promise<void> {
  const actorId = await resolveActorId();
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

    await logActivity(tx, {
      userId: actorId,
      action: becomingReceived ? "RECEIVE_PO" : "UPDATE_PO_STATUS",
      entityType: "PurchaseOrder",
      entityId: po.id,
      payload: { poNumber, status: newStatus, stockUpdated: becomingReceived },
    });
  });

  revalidatePath(SUPPLIERS_PATH);
}

// ============================================================================
// PURCHASE ORDER: update arrival date
// ============================================================================
export async function updatePOArrivalAction(
  poNumber: string,
  dateLabel: string
): Promise<void> {
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
    where: { name: { equals: beanName, mode: "insensitive" } },
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
}

// --- helpers ----------------------------------------------------------------
function parseUiDate(label: string): Date | null {
  if (!label || label === "-") return null;
  const native = new Date(label);
  if (!isNaN(native.getTime())) return native;
  return new Date();
}