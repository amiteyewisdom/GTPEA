import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import UnionRepDashboard from "@/features/dashboard/UnionRepDashboard";

export default async function UnionRepPage() {
  const stats = await fetchDashboardStats();
  return <UnionRepDashboard stats={stats} />;
}
