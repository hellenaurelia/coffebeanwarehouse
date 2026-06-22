// Server-only read layer for the Suppliers feature.
// Returns data already mapped into the UI's existing types.

import { prisma } from "@/lib/prisma";
import {
  mapSupplier,
  mapPO,
  type DbSupplierRow,
  type DbPORow,
} from "./mappers";
import type { Supplier, PO } from "../lib";

export async function getSuppliers(): Promise<Supplier[]> {
  const rows = await prisma.supplier.findMany({
    orderBy: { createdAt: "asc" },
    select: {
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
    },
  });
  return (rows as DbSupplierRow[]).map(mapSupplier);
}

export async function getPurchaseOrders(): Promise<PO[]> {
  const rows = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    select: {
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
    },
  });
  return (rows as DbPORow[]).map(mapPO);
}

// Inventory list (used by the supplier detail modal). Mapped to the UI
// InventoryItem shape declared in suppliers/lib.ts.
export async function getInventoryForSuppliers() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      sku: true,
      name: true,
      type: true,
      sellPrice: true,
      stockKg: true,
      supplierProducts: {
        select: {
          buyPricePerKg: true,
          supplier: { select: { name: true } },
        },
        take: 1,
      },
    },
  });

  return products.map((p) => ({
    sku: p.sku,
    name: p.name,
    type:
      p.name.toLowerCase().includes("luwak")
        ? "Luwak"
        : p.name.toLowerCase().includes("robusta")
        ? "Robusta"
        : p.name.toLowerCase().includes("liberica")
        ? "Liberica"
        : "Arabica",
    stock: p.stockKg,
    unit: "kg",
    cost: p.supplierProducts[0]?.buyPricePerKg ?? 0,
    price: p.sellPrice,
    exp: "—",
    supplier: p.supplierProducts[0]?.supplier.name ?? "-",
  }));
}
