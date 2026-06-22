// Server-only read layer for POS.
// Maps active products into the POS catalog Product shape:
//   { id, name, supplier, price, tag }
// `id` is the real DB product id (the UI treats it as an opaque key, so using
// the real id lets checkout resolve products without a name lookup).

import { prisma } from "@/lib/prisma";

export type POSProductDTO = {
  id: string;
  name: string;
  supplier: string;
  price: number;
  tag: string;
};

function inferTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("luwak")) return "Luwak";
  if (n.includes("robusta")) return "Robusta";
  if (n.includes("liberica")) return "Liberica";
  return "Arabica";
}

export async function getPOSProducts(): Promise<POSProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      sellPrice: true,
      supplierProducts: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { supplier: { select: { name: true } } },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    supplier: p.supplierProducts[0]?.supplier.name ?? "",
    price: p.sellPrice,
    tag: inferTag(p.name),
  }));
}
