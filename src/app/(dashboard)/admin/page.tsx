import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import AdministratorDashboard from "@/features/dashboard/AdministratorDashboard";

export default async function AdminPage() {
  const stats = await fetchDashboardStats();
  return <AdministratorDashboard stats={stats} />;
}
