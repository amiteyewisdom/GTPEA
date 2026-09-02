import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BecomeGuarantorClient from "@/features/guarantors/BecomeGuarantorClient";

export default async function BecomeGuarantorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, employee_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  const typedProfile = profile as { full_name: string; role: string; employee_id: string };

  console.log("[BecomeGuarantor] Profile data:", typedProfile);

  const employeeRes = await supabase
    .from("employees")
    .select("id, guarantor_status, guarantor_application_date, guarantor_notes, guarantor_approved_at, blacklist_reason")
    .eq("employee_no", typedProfile.employee_id)
    .maybeSingle();

  console.log("[BecomeGuarantor] Employee lookup result:", employeeRes);

  const employee = employeeRes.data as {
    id: string;
    guarantor_status: string | null;
    guarantor_application_date: string | null;
    guarantor_notes: string | null;
    guarantor_approved_at: string | null;
    blacklist_reason: string | null;
  } | null;

  return (
    <BecomeGuarantorClient
      employee={employee}
      userName={typedProfile.full_name}
    />
  );
}
