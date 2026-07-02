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
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
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

export async function getInventoryForSuppliers() {

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
    select: {
      sku: true,
      name: true,
      variety: true,
      sellPrice: true,
      stockKg: true,
      supplierProducts: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          buyPricePerKg: true,
          supplier: { select: { name: true } },
        },
      },
    },
  });

  return products.map((p) => ({
    sku: p.sku,
    name: p.name,
    type: p.variety ?? "",
    stock: p.stockKg,
    unit: "kg",
    cost: p.supplierProducts[0]?.buyPricePerKg ?? 0,
    price: p.sellPrice,
    exp: "—",
    supplier: p.supplierProducts[0]?.supplier.name ?? "-",
  }));
}