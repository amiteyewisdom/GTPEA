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
      .select("id, email, first_name, last_name, employee_no")
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
    let targetUser = authUser.users.find((u: any) => u.email === employee.email);

    // If user doesn't exist, try to create them automatically
    if (!targetUser) {
      try {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email: employee.email,
          email_confirm: true,
          user_metadata: {
            full_name: `${employee.first_name} ${employee.last_name}`,
            employee_id: employee.id,
            role: role,
          },
        });

        if (createError) {
          // If user already exists, try to find them again
          if (createError.message?.includes("email_exists") || createError.code === "email_exists") {
            const { data: retryAuthUser } = await admin.auth.admin.listUsers();
            targetUser = retryAuthUser.users.find((u: any) => u.email === employee.email);
            
            if (!targetUser) {
              console.error("[/api/admin/assign-role] User exists but not found after retry");
              return NextResponse.json(
                { error: "User account exists but could not be found. Please contact support." },
                { status: 500 }
              );
            }
          } else {
            console.error("[/api/admin/assign-role] Create user error:", createError);
            return NextResponse.json(
              { error: "Failed to create user account." },
              { status: 500 }
            );
          }
        } else {
          targetUser = newUser.user;
        }
      } catch (createErr: any) {
        console.error("[/api/admin/assign-role] Create user exception:", createErr);
        return NextResponse.json(
          { error: "Failed to create user account." },
          { status: 500 }
        );
      }
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
      message: targetUser.email === employee.email 
        ? `Role ${role} assigned successfully` 
        : `User account created and role ${role} assigned successfully`,
    });
  } catch (err: any) {
    console.error("[/api/admin/assign-role] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
