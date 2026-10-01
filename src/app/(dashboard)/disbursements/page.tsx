import { DisbursementsClient } from "@/features/pages/DisbursementsClient";
import { fetchDisbursementsData } from "@/lib/data/page-data";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disbursements" };

export default async function DisbursementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()) as { data: { role: string } | null };

  if (!["fund_manager", "administrator", "super_admin"].includes(profile?.role ?? "")) {
    redirect("/dashboard");
  }

  const { disbursements } = await fetchDisbursementsData();
  return <DisbursementsClient disbursements={disbursements} />;
}
