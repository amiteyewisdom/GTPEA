import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import FundManagerDashboard from "@/features/dashboard/FundManagerDashboard";

export default async function FundManagerPage() {
  const stats = await fetchDashboardStats();
  return <FundManagerDashboard stats={stats} />;
}
