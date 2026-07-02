"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
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

// Sekarang actor diambil dari sesi login yang sebenarnya.
async function resolveActorId(): Promise<string> {
  const user = await requireUser();
  return user.id;
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
      product: { select: { name: true, variety: true, stockKg: true } },
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
  const isUpdate = Boolean(data.id);

  if (data.id) {
    await prisma.supplier.update({ where: { id: data.id }, data: base });
    supplierId = data.id;
  } else {
    // Generate kode S-001, S-002, ... di dalam transaksi biar gak collide.
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

  // Sync beans -> supplierProducts. Bean baru otomatis dibuat jadi Product
  // (stock 0, type WHOLE_BEAN default) kalau namanya belum ada di DB.
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

  const keptProductIds = new Set<string>();

  for (const bean of data.beans) {
    let productId = productByName.get(bean.name);
    const isNewProduct = !productId;

    if (!productId) {
      const created = await prisma.product.create({
        data: {
          sku: await generateProductSku(),
          name: bean.name,
          type: "WHOLE_BEAN",
          variety: bean.type || null,
          sellPrice: 0,
          stockKg: 0,
          minStockKg: 0,
          isActive: true,
          createdById: actorId,
        },
        select: { id: true },
      });
      productId = created.id;
      productByName.set(bean.name, productId);
    }

    keptProductIds.add(productId);

    // variety udah ke-set saat create; cuma perlu update kalau produk lama.
    if (bean.type && !isNewProduct) {
      await prisma.product.update({
        where: { id: productId },
        data: { variety: bean.type },
      });
    }

    const existingLinkId = linkByProductId.get(productId);

    // ------------------------------------------------------------------
    // ATURAN BARU (poin 1): bean TIDAK boleh dinonaktifkan kalau stok > 0.
    // Kalau user mencoba men-set bean.active = false padahal produk masih
    // punya stok, kita tolak.
    // ------------------------------------------------------------------
    const wantActive = bean.active ?? true;
    if (!wantActive) {
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        select: { stockKg: true, name: true },
      });
      if (prod && prod.stockKg > 0) {
        throw new Error(
          `Biji kopi "${prod.name}" tidak bisa dinonaktifkan karena stok masih ${prod.stockKg} kg. Habiskan / rekonsiliasi stok ke 0 dulu.`
        );
      }
    }

    if (existingLinkId) {
      await prisma.supplierProduct.update({
        where: { id: existingLinkId },
        data: { buyPricePerKg: bean.price, isActive: wantActive },
      });
    } else {
      await prisma.supplierProduct.create({
        data: {
          supplierId,
          productId,
          buyPricePerKg: bean.price,
          isActive: wantActive,
        },
      });
    }
  }

  // ------------------------------------------------------------------
  // Bean yang dihapus dari form -> link-nya dihapus.
  // ATURAN BARU (poin 1): bean TIDAK boleh dihapus kalau stok > 0.
  // ------------------------------------------------------------------
  const linksToRemove = existingLinks.filter(
    (l) => !keptProductIds.has(l.productId)
  );

  if (linksToRemove.length > 0) {
    const removeProductIds = linksToRemove.map((l) => l.productId);
    const removeProducts = await prisma.product.findMany({
      where: { id: { in: removeProductIds } },
      select: { id: true, name: true, stockKg: true },
    });
    const blocked = removeProducts.filter((p) => p.stockKg > 0);
    if (blocked.length > 0) {
      const names = blocked.map((p) => `"${p.name}" (${p.stockKg} kg)`).join(", ");
      throw new Error(
        `Biji kopi berikut tidak bisa dihapus karena stok masih ada: ${names}.`
      );
    }

    await prisma.supplierProduct.deleteMany({
      where: { id: { in: linksToRemove.map((l) => l.id) } },
    });
  }

  const row = await prisma.supplier.findUniqueOrThrow({
    where: { id: supplierId },
    select: supplierSelect,
  });

  await logActivity({
    actorId,
    action: isUpdate ? "SUPPLIER_UPDATE" : "SUPPLIER_CREATE",
    entityType: "Supplier",
    entityId: supplierId,
    payload: { name: data.name, status: data.status, beans: beanNames },
  });

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
  return mapSupplier(row as DbSupplierRow);
}

// ============================================================================
// SUPPLIER: delete (soft — set deletedAt).
// ATURAN BARU (poin 2): supplier TIDAK boleh dihapus kalau masih punya biji
// kopi (link supplierProduct apa pun). User harus melepas semua bean dari
// supplier ini dulu (dan bean hanya bisa dilepas kalau stoknya 0 — poin 1).
// Untuk sekadar "berhenti pakai" supplier tanpa menghapus, gunakan nonaktif
// (poin 3) — itu tetap diizinkan lewat saveSupplierAction.
// ============================================================================
export async function deleteSupplierAction(id: string): Promise<void> {
  const actorId = await resolveActorId();

  const links = await prisma.supplierProduct.findMany({
    where: { supplierId: id },
    select: { productId: true, product: { select: { name: true } } },
  });

  if (links.length > 0) {
    const names = [...new Set(links.map((l) => l.product.name))]
      .map((n) => `"${n}"`)
      .join(", ");
    throw new Error(
      `Supplier tidak bisa dihapus karena masih memiliki biji kopi: ${names}. Lepaskan semua biji kopi dari supplier ini dulu, atau nonaktifkan supplier saja.`
    );
  }

  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    actorId,
    action: "SUPPLIER_DELETE",
    entityType: "Supplier",
    entityId: id,
  });

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

  const last = await prisma.purchaseOrder.findFirst({
    orderBy: { poNumber: "desc" },
    select: { poNumber: true },
  });
  const lastNum = last ? parseInt(last.poNumber.replace(/\D/g, ""), 10) || 0 : 0;
  const poNumber = `PO-${String(lastNum + 1).padStart(4, "0")}`;

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

    // Pastikan link supplier<->produk aktif, biar lolos filter Inventory.
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

  await logActivity({
    actorId,
    action: "PO_CREATE",
    entityType: "PurchaseOrder",
    entityId: created.id,
    payload: { poNumber, supplierId: partial.supplierId, totalAmount },
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

  await logActivity({
    actorId,
    action: becomingReceived ? "PO_RECEIVE" : "PO_STATUS_UPDATE",
    entityType: "PurchaseOrder",
    entityId: po.id,
    payload: { poNumber, newStatus },
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
  const parsed = parseUiDate(dateLabel);
  await prisma.purchaseOrder.update({
    where: { poNumber },
    data: { receivedAt: parsed },
  });
  revalidatePath(SUPPLIERS_PATH);
}

// ============================================================================
// SUPPLIER BEAN: toggle active
// ATURAN BARU (poin 1): tidak boleh menonaktifkan bean yang stoknya > 0.
// Mengaktifkan kembali selalu boleh.
// ============================================================================
export async function toggleBeanAction(
  supplierId: string,
  beanName: string
): Promise<void> {
  const actorId = await resolveActorId();

  const product = await prisma.product.findFirst({
    where: { name: beanName },
    select: { id: true, stockKg: true, name: true },
  });
  if (!product) return;

  const sp = await prisma.supplierProduct.findFirst({
    where: { supplierId, productId: product.id },
    select: { id: true, isActive: true },
  });
  if (!sp) return;

  const nextActive = !sp.isActive;

  // Kalau mau MENONAKTIFKAN tapi stok masih ada → tolak.
  if (!nextActive && product.stockKg > 0) {
    throw new Error(
      `Biji kopi "${product.name}" tidak bisa dinonaktifkan karena stok masih ${product.stockKg} kg.`
    );
  }

  await prisma.supplierProduct.update({
    where: { id: sp.id },
    data: { isActive: nextActive },
  });

  await logActivity({
    actorId,
    action: nextActive ? "BEAN_ACTIVATE" : "BEAN_DEACTIVATE",
    entityType: "Product",
    entityId: product.id,
    payload: { beanName, supplierId },
  });

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath(INVENTORY_PATH);
}

// --- helpers ----------------------------------------------------------------
async function generateProductSku(): Promise<string> {
  const last = await prisma.product.findFirst({
    where: { sku: { startsWith: "BEAN-" } },
    orderBy: { sku: "desc" },
    select: { sku: true },
  });
  const lastNum = last ? parseInt(last.sku.replace(/\D/g, ""), 10) || 0 : 0;
  return `BEAN-${String(lastNum + 1).padStart(3, "0")}`;
}

function parseUiDate(label: string): Date | null {
  if (!label || label === "-") return null;
  const native = new Date(label);
  if (!isNaN(native.getTime())) return native;
  return new Date();
}