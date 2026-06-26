import { prisma } from "@/lib/prisma";

export type BeanCatalogItem = {
  id: string;
  name: string;
  type: string;
  origin: string;
  process: string;
  notes: string[];
  price: number;
  stock: number;
  rating: number;
};

const NAME_PROFILE: { match: string; process: string; notes: string[]; rating: number }[] = [
  { match: "gayo",     process: "Natural",      notes: ["Wine", "Berry", "Dark Chocolate"], rating: 4.8 },
  { match: "kintamani", process: "Honey",       notes: ["Citrus", "Orange", "Floral"],       rating: 4.6 },
  { match: "toraja",   process: "Washed",       notes: ["Spice", "Cocoa", "Brown Sugar"],    rating: 4.7 },
  { match: "luwak",    process: "Wild Civet",   notes: ["Caramel", "Nutty", "Smooth"],        rating: 4.9 },
  { match: "lampung",  process: "Dry",          notes: ["Earthy", "Bold", "Cocoa"],           rating: 4.4 },
  { match: "preanger", process: "Semi-Washed",  notes: ["Herbal", "Tobacco", "Cedar"],        rating: 4.5 },
  { match: "java",     process: "Semi-Washed",  notes: ["Herbal", "Tobacco", "Cedar"],        rating: 4.5 },
  { match: "flores",   process: "Wet Hulled",   notes: ["Vanilla", "Almond", "Floral"],       rating: 4.6 },
  { match: "bajawa",   process: "Wet Hulled",   notes: ["Vanilla", "Almond", "Floral"],       rating: 4.6 },
  { match: "liberica", process: "Natural",      notes: ["Smoky", "Fruity", "Woody"],          rating: 4.3 },
  { match: "meranti",  process: "Natural",      notes: ["Smoky", "Fruity", "Woody"],          rating: 4.3 },
  { match: "bengkulu", process: "Honey",        notes: ["Caramel", "Nutty", "Sweet"],         rating: 4.5 },
];

const VARIETY_FALLBACK: Record<string, { process: string; notes: string[]; rating: number }> = {
  Arabica:  { process: "Washed",  notes: ["Fruity", "Floral", "Bright Acidity"], rating: 4.5 },
  Robusta:  { process: "Dry",     notes: ["Earthy", "Bold", "Cocoa"],            rating: 4.3 },
  Liberica: { process: "Natural", notes: ["Smoky", "Woody", "Fruity"],           rating: 4.2 },
  Luwak:    { process: "Wild Civet", notes: ["Caramel", "Nutty", "Smooth"],      rating: 4.8 },
};

function inferProfile(name: string, variety: string) {
  const n = name.toLowerCase();
  const found = NAME_PROFILE.find((p) => n.includes(p.match));
  if (found) return found;
  return VARIETY_FALLBACK[variety] ?? { process: "Washed", notes: ["Bold", "Aromatic"], rating: 4.5 };
}

// Visibility sama dengan Inventory: aktif, stok > 0, punya supplier aktif.
export async function getBeansCatalog(): Promise<BeanCatalogItem[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stockKg: { gt: 0 },
      supplierProducts: {
        some: { isActive: true, supplier: { isActive: true, deletedAt: null } },
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      variety: true,
      sellPrice: true,
      stockKg: true,
      supplierProducts: {
        where: { isActive: true, supplier: { isActive: true, deletedAt: null } },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { supplier: { select: { region: true } } },
      },
    },
  });

  return products.map((p) => {
    const type = p.variety || "Arabica";
    const profile = inferProfile(p.name, type);
    return {
      id: p.id,
      name: p.name,
      type,
      origin: p.supplierProducts[0]?.supplier.region ?? "—",
      process: profile.process,
      notes: profile.notes,
      price: p.sellPrice,
      stock: p.stockKg,
      rating: profile.rating,
    };
  });
}