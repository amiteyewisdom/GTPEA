import { createClient } from "@/lib/supabase/server";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null, employeeUuid: null };
  }

  const profileRes = await (supabase
    .from("profiles")
    .select("id, full_name, role, employee_id, phone, is_active")
    .eq("user_id", user.id)
    .single() as any);

  const profile = profileRes.data;
  // Use the employee_id from profile directly - it should already be the correct UUID
  // Only try to resolve if it looks like an employee_no (not a UUID)
  const employeeUuid = profile?.employee_id
    ? (profile.employee_id.includes('-') ? profile.employee_id : await resolveEmployeeUuid(supabase, profile.employee_id))
    : null;

  return { supabase, user, profile, employeeUuid };
}

export async function resolveEmployeeUuid(supabase: any, employeeRef: string) {
  console.log('[resolveEmployeeUuid] Resolving employeeRef:', employeeRef);
  
  // Try by UUID directly
  try {
    const byId = await supabase
      .from("employees")
      .select("id")
      .eq("id", employeeRef)
      .maybeSingle();
    console.log('[resolveEmployeeUuid] UUID lookup result:', byId.data);
    if (byId.data?.id) return byId.data.id as string;
  } catch (error) {
    console.log('[resolveEmployeeUuid] UUID lookup failed:', error);
  }

  // Fallback: try by employee_no
  const byNo = await supabase.from("employees").select("id").eq("employee_no", employeeRef).maybeSingle();
  console.log('[resolveEmployeeUuid] employee_no lookup result:', byNo.data);
  return (byNo.data?.id as string) ?? null;
}
