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
    .select("role, employee_id, phone")
    .eq("user_id", user.id)
    .single();

  const profile = profileRes.data as { role: string; employee_id: string | null; phone: string | null } | null;
  const role = profile?.role ?? "employee";

  // If employee_id is already a valid UUID, use it directly
  if (profile?.employee_id && profile.employee_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log("[getLoggedInEmployee] Using employee_id as UUID:", profile.employee_id);
    return { userId: user.id, employeeId: profile.employee_id, role };
  }

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

  // Fallback: try phone number lookup
  if (profile?.phone) {
    const phone = profile.phone;
    const phoneVariants = [
      phone,
      phone.replace(/\+/g, ""),
      phone.startsWith("233") ? "0" + phone.substring(3) : "233" + phone.substring(1),
    ];

    for (const phoneVariant of phoneVariants) {
      const phoneRes = await supabase
        .from("employees")
        .select("id")
        .eq("phone_number", phoneVariant)
        .maybeSingle();

      if (phoneRes.data?.id) {
        console.log("[getLoggedInEmployee] Found employee by phone:", phoneVariant);
        return { userId: user.id, employeeId: phoneRes.data.id, role };
      }
    }
  }

  return null;
}
