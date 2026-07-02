
import { getDashboardData } from "./_data/repository";
import DashboardClient from "./_components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}
