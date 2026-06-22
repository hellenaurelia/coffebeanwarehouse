// Server component: aggregates real DB data into the dashboard ranges,
// then renders the existing Reports UI unchanged.

import { getReportsData } from "./_data/repository";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const dataByRange = await getReportsData();
  return <ReportsClient dataByRange={dataByRange} />;
}
