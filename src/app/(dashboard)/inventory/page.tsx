// Server component: fetches inventory from the DB and renders the existing
// client UI unchanged. The InventoryItem type is re-exported here because
// child components import it from "../page".

import { getInventory } from "./_data/repository";
import InventoryClient from "./inventory-client";

export type { InventoryItem } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await getInventory();
  return <InventoryClient initial={items} />;
}
