import { resolveEmployeeUuid } from "@/lib/data/session";

type EmployeeLookup = {
  userId: string;
  employeeId: string;
  role: string;
};

export async function getLoggedInEmployee(
  supabase: any
): Promise<EmployeeLookup | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role, employee_id")
    .eq("user_id", user.id)
    .single();

  const profile = profileRes.data as { role: string; employee_id: string | null } | null;
  const role = profile?.role ?? "employee";

  if (profile?.employee_id) {
    const employeeId = await resolveEmployeeUuid(supabase, profile.employee_id);
    if (employeeId) {
      return { userId: user.id, employeeId, role };
    }
  }

  if (user.email) {
    const emailRes = await supabase
      .from("employees")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (emailRes.data?.id) {
      return { userId: user.id, employeeId: emailRes.data.id, role };
    }
  }

  return null;
}
