import { getBeansCatalog } from "./_data/repository";
import BeansClient from "./beans-client";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const beans = await getBeansCatalog();
  return <BeansClient initial={beans} />;
}