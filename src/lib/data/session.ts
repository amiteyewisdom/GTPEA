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
    .select("id, full_name, role, employee_id, is_active")
    .eq("user_id", user.id)
    .single() as any);

  const profile = profileRes.data;
  const employeeUuid = profile?.employee_id
    ? await resolveEmployeeUuid(supabase, profile.employee_id)
    : null;

  return { supabase, user, profile, employeeUuid };
}

export async function resolveEmployeeUuid(supabase: any, employeeRef: string) {
  // Try by UUID (cast text to uuid safely)
  try {
    const byId = await supabase
      .from("employees")
      .select("id")
      .filter("id", "eq", employeeRef)
      .maybeSingle();
    if (byId.data?.id) return byId.data.id as string;
  } catch {}

  // Fallback: try by employee_no
  const byNo = await supabase.from("employees").select("id").eq("employee_no", employeeRef).maybeSingle();
  return (byNo.data?.id as string) ?? null;
}
