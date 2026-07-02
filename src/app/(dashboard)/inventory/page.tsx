import { getInventory } from "./_data/repository";
import InventoryClient from "./inventory-client";

export type { InventoryItem } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await getInventory();
  return <InventoryClient initial={items} />;
}
