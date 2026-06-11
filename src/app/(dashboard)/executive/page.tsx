import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import ChairpersonDashboard from "@/features/dashboard/ChairpersonDashboard";

export default async function ExecutivePage() {
  const stats = await fetchDashboardStats();
  return <ChairpersonDashboard stats={stats} />;
}
