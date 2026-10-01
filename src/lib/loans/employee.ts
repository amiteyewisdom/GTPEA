import { resolveEmployeeUuid } from "@/lib/data/session";
import { createAdminClient } from "@/lib/supabase/admin";

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
    .select("role, employee_id, phone, full_name")
    .eq("user_id", user.id)
    .single();

  const profile = profileRes.data as { role: string; employee_id: string | null; phone: string | null; full_name: string | null } | null;
  const role = profile?.role ?? "employee";

  // Use admin client to bypass RLS
  const admin = createAdminClient();

  // If employee_id is already a valid UUID, use it directly
  if (profile?.employee_id && profile.employee_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log("[getLoggedInEmployee] Using employee_id as UUID:", profile.employee_id);

    // Verify the employee actually exists with this UUID
    const verifyRes = await admin.from("employees").select("id").eq("id", profile.employee_id).maybeSingle();
    if (verifyRes.data?.id) {
      return { userId: user.id, employeeId: profile.employee_id, role };
    }
    console.log("[getLoggedInEmployee] Employee UUID exists in profile but not in employees table, trying fallbacks");
  }

  if (profile?.employee_id) {
    const employeeId = await resolveEmployeeUuid(supabase, profile.employee_id);
    if (employeeId) {
      return { userId: user.id, employeeId, role };
    }
  }

  // Fallback: try email lookup with admin client
  if (user.email) {
    const emailRes = await admin
      .from("employees")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (emailRes.data?.id) {
      console.log("[getLoggedInEmployee] Found employee by email:", user.email);
      return { userId: user.id, employeeId: emailRes.data.id, role };
    }
  }

  // Fallback: try phone number lookup with admin client
  if (profile?.phone) {
    const phone = profile.phone;
    const phoneVariants = [
      phone,
      phone.replace(/\+/g, ""),
      phone.startsWith("233") ? "0" + phone.substring(3) : "233" + phone.substring(1),
    ];

    for (const phoneVariant of phoneVariants) {
      const phoneRes = await admin
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

  // Fallback: try name lookup
  if (profile?.full_name) {
    const nameParts = profile.full_name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (firstName && lastName) {
      const nameRes = await admin
        .from("employees")
        .select("id")
        .eq("first_name", firstName)
        .eq("last_name", lastName)
        .maybeSingle();

      if (nameRes.data?.id) {
        console.log("[getLoggedInEmployee] Found employee by name:", firstName, lastName);
        return { userId: user.id, employeeId: nameRes.data.id, role };
      }
    }
  }

  console.log("[getLoggedInEmployee] Could not find employee for user:", user.id);
  return null;
}
