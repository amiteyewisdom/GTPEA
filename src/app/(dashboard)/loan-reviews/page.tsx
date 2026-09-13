import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoanReviewsPageComponent from "@/features/dashboard/LoanReviewsPage";
import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";

export default async function LoanReviewsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile as any).role !== "union_rep") {
    redirect("/dashboard");
  }

  const stats = await fetchDashboardStats();

  return <LoanReviewsPageComponent stats={stats} />;
}
