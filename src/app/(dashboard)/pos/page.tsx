import { getPOSProducts } from "./_data/repository";
import POSClient from "./pos-client";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const products = await getPOSProducts();
  return <POSClient products={products} />;
}
