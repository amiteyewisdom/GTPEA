import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GuarantorRequestsClient from "@/features/guarantors/GuarantorRequestsClient";

export default async function GuarantorRequestsPage() {
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
  const employeeNo = typedProfile.employee_id;

  if (!employeeNo) {
    redirect("/dashboard");
  }

  // Get employee record by employee_no (not id, since employee_id in profiles is employee_no)
  const employeeRes = await supabase
    .from("employees")
    .select("id")
    .eq("employee_no", employeeNo)
    .maybeSingle();

  const employee = employeeRes.data as { id: string } | null;

  if (!employee) {
    redirect("/dashboard");
  }

  // Fetch pending guarantor consent requests
  const requestsRes = await supabase
    .from("loan_guarantors")
    .select(`
      id,
      loan_id,
      account_number,
      amount,
      consent_status,
      consent_notes,
      loans!inner (
        loan_ref,
        amount_requested,
        term_months,
        purpose,
        created_at,
        employee_id,
        employees!inner (
          first_name,
          last_name,
          employee_no
        )
      )
    `)
    .eq("guarantor_id", employee.id)
    .eq("consent_status", "pending");

  console.log("[GuarantorRequests] Employee ID:", employee.id);
  console.log("[GuarantorRequests] Query result:", JSON.stringify(requestsRes, null, 2));

  const requests = requestsRes.data || [];

  return (
    <GuarantorRequestsClient
      requests={requests}
      employeeId={employee.id}
    />
  );
}
