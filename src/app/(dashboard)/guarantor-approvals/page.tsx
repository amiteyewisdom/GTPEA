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

  // Fetch pending guarantor applications (only those who have actually applied)
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
    .not("guarantor_application_date", "is", null)
    .order("guarantor_application_date", { ascending: false });

  console.log("[GuarantorApprovals] Query error:", applicationsRes.error);
  console.log("[GuarantorApprovals] Applications found:", (applicationsRes.data as any)?.length || 0);
  console.log("[GuarantorApprovals] Applications data:", JSON.stringify(applicationsRes.data, null, 2));

  const applications = applicationsRes.data || [];

  return (
    <GuarantorApprovalsClient
      applications={applications}
      userRole={typedProfile.role}
    />
  );
}
