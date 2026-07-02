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
  // ATURAN BARU (poin 4): bean dengan stok 0 TETAP tampil di Inventory.
  // Karena itu filter `stockKg: { gt: 0 }` DIHAPUS.
  //
  // Syarat "punya supplier aktif" juga dilonggarkan: kita tetap butuh produk
  // aktif, tapi produk yang stoknya sudah 0 boleh muncul walau supplier link-nya
  // sedang nonaktif — supaya kartu "Kritis / Habis" tidak hilang begitu saja.
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
    supplier: p.supplierProducts[0]?.supplier.name ?? "-",
    photo: getBeanImage(inferTag(p.name)),
  }));
}