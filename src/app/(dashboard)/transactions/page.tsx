
import { getTransactions } from "./_data/repository";
import TransactionsClient from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const data = await getTransactions();
  return <TransactionsClient data={data} />;
}
