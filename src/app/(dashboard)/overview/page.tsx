import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import SuperAdminDashboard from "@/features/dashboard/SuperAdminDashboard";

export default async function OverviewPage() {
  const stats = await fetchDashboardStats();
  return <SuperAdminDashboard stats={stats} />;
}
