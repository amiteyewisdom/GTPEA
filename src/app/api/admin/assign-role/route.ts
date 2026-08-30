import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, role } = body;

    if (!employeeId || !role) {
      return NextResponse.json(
        { error: "Employee ID and role are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Verify the requester is a super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can assign roles." },
        { status: 403 }
      );
    }

    // Validate the role
    const validRoles = ["chairperson", "administrator", "fund_manager", "union_rep", "employee"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    // Find the employee and their associated user
    const { data: employee, error: employeeError } = await admin
      .from("employees")
      .select("id, email")
      .eq("employee_no", employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    // Find the user associated with this employee
    const { data: authUser } = await admin.auth.admin.listUsers();
    const targetUser = authUser.users.find((u: any) => u.email === employee.email);

    if (!targetUser) {
      return NextResponse.json(
        { error: "User account not found for this employee." },
        { status: 404 }
      );
    }

    // Update the role in profiles table
    const { error: updateError } = await admin
      .from("profiles")
      .update({ role })
      .eq("user_id", targetUser.id);

    if (updateError) {
      console.error("[/api/admin/assign-role] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to assign role." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role ${role} assigned successfully`,
    });
  } catch (err: any) {
    console.error("[/api/admin/assign-role] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
