import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import GuarantorRequestsClient from "@/features/guarantors/GuarantorRequestsClient";

export default async function GuarantorRequestsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

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
  const employeeId = typedProfile.employee_id;

  if (!employeeId) {
    redirect("/dashboard");
  }

  let employeeUuid: string | null = null;

  // If employee_id is already a valid UUID, use it directly
  if (employeeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log("[GuarantorRequests] employee_id is a UUID, using directly:", employeeId);
    employeeUuid = employeeId;
  } else {
    // Otherwise, look up by employee_no
    const employeeRes = await admin
      .from("employees")
      .select("id")
      .eq("employee_no", employeeId)
      .maybeSingle();

    employeeUuid = employeeRes.data?.id ?? null;
  }

  if (!employeeUuid) {
    console.log("[GuarantorRequests] Could not resolve employee UUID for:", employeeId);
    redirect("/dashboard");
  }

  // Debug: Check all loan_guarantors for this employee
  const allGuarantorsRes = await admin
    .from("loan_guarantors")
    .select("*")
    .eq("guarantor_id", employeeUuid);

  console.log("[GuarantorRequests] All loan_guarantors for employee:", JSON.stringify(allGuarantorsRes.data, null, 2));

  // Fetch all guarantor consent requests
  const requestsRes = await admin
    .from("loan_guarantors")
    .select(`
      id,
      loan_id,
      account_number,
      amount,
      consent_status,
      consent_notes,
      consent_responded_at,
      loans!inner (
        loan_ref,
        amount_requested,
        term_months,
        purpose,
        created_at,
        employee_id,
        employees!loans_employee_id_fkey (
          first_name,
          last_name,
          employee_no
        )
      )
    `)
    .eq("guarantor_id", employeeUuid);

  console.log("[GuarantorRequests] Employee ID:", employeeUuid);
  console.log("[GuarantorRequests] Query error:", requestsRes.error);
  console.log("[GuarantorRequests] Query result:", JSON.stringify(requestsRes.data, null, 2));

  const requests = requestsRes.data || [];

  return (
    <GuarantorRequestsClient
      requests={requests}
      employeeId={employeeUuid}
    />
  );
}
