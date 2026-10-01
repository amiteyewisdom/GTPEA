import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";
import { DEFAULT_USER_PASSWORD } from "@/lib/imports/process-users";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManageUsers(role)) {
    return NextResponse.json({ error: "Only Admins can reset employee accounts." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const employeeId = body.employeeId as string | undefined;

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get employee details (phone_number does not exist on employees — it's `phone`)
    const { data: employee, error: employeeError } = await (adminClient
      .from("employees") as any)
      .select("id, employee_no, email, phone")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Get the auth user ID from profiles — employee_id may hold the employee
    // UUID (current convention) or a legacy employee_no.
    let { data: profile } = await (adminClient
      .from("profiles") as any)
      .select("user_id")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (!profile) {
      const fallback = await (adminClient
        .from("profiles") as any)
        .select("user_id")
        .eq("employee_id", employee.employee_no)
        .maybeSingle();
      profile = fallback.data;
    }

    if (!profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Reset auth password to default
    const { error: authError } = await adminClient.auth.admin.updateUserById(profile.user_id, {
      password: DEFAULT_USER_PASSWORD,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Clear phone number from employees table
    const { error: phoneError } = await (adminClient
      .from("employees") as any)
      .update({ phone_number: null, password_changed_at: null })
      .eq("id", employeeId);

    if (phoneError) {
      return NextResponse.json({ error: phoneError.message }, { status: 500 });
    }

    // Set must_change_password in profiles
    const { error: profileUpdateError } = await (adminClient
      .from("profiles") as any)
      .update({ must_change_password: true })
      .eq("user_id", profile.user_id);

    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message }, { status: 500 });
    }

    // Log the action
    await (adminClient.from("audit_logs") as any).insert({
      action: "EMPLOYEE_ACCOUNT_RESET",
      entity_type: "employee",
      entity_id: employeeId,
      performed_by: user.id,
      details: {
        employee_no: employee.employee_no,
        email: employee.email,
        previous_phone: employee.phone_number,
      },
    });

    return NextResponse.json({
      message: "Employee account reset successfully. They will need to set up their phone number and change their password on next login.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset employee account." },
      { status: 500 }
    );
  }
}
