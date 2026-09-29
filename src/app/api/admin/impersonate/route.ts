import { NextResponse } from "next/server";
import { canImpersonate, getStaffUser } from "@/lib/api/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to impersonate users." }, { status: 401 });
  }

  if (!canImpersonate(role)) {
    return NextResponse.json({ error: "Only super admins can impersonate users." }, { status: 403 });
  }

  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Get the employee's auth user
    const { data: employee } = await adminSupabase
      .from("employees")
      .select("email")
      .eq("id", employeeId)
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Get the auth user by email
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    const authUser = authUsers.users.find((u: any) => u.email === employee.email);

    if (!authUser) {
      return NextResponse.json({ error: "Auth user not found for this employee." }, { status: 404 });
    }

    // Log the impersonation for audit purposes
    await adminSupabase.from("audit_logs").insert({
      action: "impersonate",
      actor_id: user.id,
      actor_role: role,
      target_user_id: authUser.id,
      target_employee_id: employeeId,
      metadata: { impersonated_email: employee.email },
    });

    // Generate a new session for the target user
    const { data: sessionData, error: sessionError } = await adminSupabase.auth.admin.createSession({
      userId: authUser.id,
    });

    if (sessionError) {
      return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      employee_email: employee.email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impersonation failed." },
      { status: 500 }
    );
  }
}
