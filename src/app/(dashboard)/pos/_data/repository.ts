import { prisma } from "@/lib/prisma";
import { getBeanImage } from "@/lib/product-image";

export type POSProductDTO = {
  id: string;
  name: string;
  supplier: string;
  price: number;
  tag: string;
  image: string;
  stock: number; // ← TAMBAHAN: dipakai kasir untuk deteksi "habis"
};

function inferTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("luwak")) return "Luwak";
  if (n.includes("robusta")) return "Robusta";
  if (n.includes("liberica")) return "Liberica";
  return "Arabica";
}

export async function getPOSProducts(): Promise<POSProductDTO[]> {
  // Semua produk aktif tampil, TERMASUK yang stoknya 0 (poin 4).
  // Blokir CO ditangani di client (klik → notif habis) + guard di checkoutAction.
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      sellPrice: true,
      stockKg: true,
      supplierProducts: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { supplier: { select: { name: true } } },
      },
    },
  });

  return products.map((p) => {
    const tag = inferTag(p.name);
    return {
      id: p.id,
      name: p.name,
      supplier: p.supplierProducts[0]?.supplier.name ?? "",
      price: p.sellPrice,
      tag,
      image: getBeanImage(tag),
      stock: p.stockKg, // ← TAMBAHAN
    };
  });
}