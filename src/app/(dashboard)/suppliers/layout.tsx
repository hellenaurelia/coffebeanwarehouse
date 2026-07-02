
import { getSuppliers, getPurchaseOrders, getInventoryForSuppliers } from "./_data/repository";
import { SuppliersShell } from "./suppliers-shell";

export const dynamic = "force-dynamic";

export default async function SuppliersLayout({ children }: { children: React.ReactNode }) {
  const [suppliers, pos, inventory] = await Promise.all([
    getSuppliers(),
    getPurchaseOrders(),
    getInventoryForSuppliers(),
  ]);

  return (
    <SuppliersShell
      initialSuppliers={suppliers}
      initialPOs={pos}
      initialInventory={inventory}
    >
      {children}
    </SuppliersShell>
  );
}
