import { prisma } from "@/lib/prisma";
import { getBeanImage } from "@/lib/product-image";

export type InventoryItemDTO = {
  sku: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  supplier: string;
  photo?: string;
  exp?: string;
};

function inferTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("luwak")) return "Luwak";
  if (n.includes("robusta")) return "Robusta";
  if (n.includes("liberica")) return "Liberica";
  return "Arabica";
}

export async function getInventory(): Promise<InventoryItemDTO[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stockKg: { gt: 0 },
      supplierProducts: {
        some: {
          isActive: true,
          supplier: { isActive: true },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      sku: true,
      name: true,
      variety: true,
      sellPrice: true,
      stockKg: true,
      supplierProducts: {
        where: {
          isActive: true,
          supplier: { isActive: true },
        },
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
    supplier: p.supplierProducts[0]?.supplier.name ?? "-",
    photo: getBeanImage(inferTag(p.name)),
  }));
}