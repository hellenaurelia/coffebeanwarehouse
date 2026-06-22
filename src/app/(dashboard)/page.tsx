// Server component: aggregates real dashboard data and hands it to the client.
// The visual layout lives in _components/dashboard-client.tsx (JSX preserved).

import { getDashboardData } from "./_data/repository";
import DashboardClient from "./_components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}
