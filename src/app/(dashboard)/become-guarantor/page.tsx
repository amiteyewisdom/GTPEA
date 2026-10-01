import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Use the admin client for this own-record lookup: the employees RLS policy
  // "Employees can view own record" relies on current_employee_id(), which does not
  // yet resolve profiles.employee_id UUIDs on the live DB.
  const admin = createAdminClient();
  const employeeRef = typedProfile.employee_id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeRef ?? "");
  const employeeRes = employeeRef
    ? await admin
        .from("employees")
        .select("id, guarantor_status, guarantor_application_date, guarantor_notes, guarantor_approved_at, blacklist_reason")
        .eq(isUuid ? "id" : "employee_no", employeeRef)
        .maybeSingle()
    : { data: null, error: null };

  console.log("[BecomeGuarantor] Employee lookup result:", employeeRes);

  const employee = employeeRes.data as {
    id: string;
    guarantor_status: string | null;
    guarantor_application_date: string | null;
    guarantor_notes: string | null;
    guarantor_approved_at: string | null;
    blacklist_reason: string | null;
  } | null;

  // guarantor_status historically defaulted to 'pending' on all rows; a pending
  // row with no application date is not a real application.
  if (employee && employee.guarantor_status === "pending" && !employee.guarantor_application_date) {
    employee.guarantor_status = null;
  }

  return (
    <BecomeGuarantorClient
      employee={employee}
      userName={typedProfile.full_name}
    />
  );
}
