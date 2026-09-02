import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GuarantorApprovalsClient from "@/features/guarantors/GuarantorApprovalsClient";

export default async function GuarantorApprovalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  const typedProfile = profile as { full_name: string; role: string };

  if (typedProfile.role !== "union_rep" && typedProfile.role !== "administrator" && typedProfile.role !== "super_admin") {
    redirect("/dashboard");
  }

  // Fetch pending guarantor applications
  const applicationsRes = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      employee_no,
      guarantor_status,
      guarantor_application_date,
      guarantor_notes
    `)
    .eq("guarantor_status", "pending")
    .order("guarantor_application_date", { ascending: true, nullsFirst: true });

  const applications = applicationsRes.data || [];

  // Fetch approved guarantors
  const approvedGuarantorsRes = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      employee_no,
      guarantor_status,
      guarantor_approved_at
    `)
    .eq("guarantor_status", "approved")
    .order("guarantor_approved_at", { ascending: false });

  const approvedGuarantors = approvedGuarantorsRes.data || [];

  return (
    <GuarantorApprovalsClient
      applications={applications}
      approvedGuarantors={approvedGuarantors}
      userRole={typedProfile.role}
    />
  );
}
