import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
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
        { error: "Only super admins can view board members." },
        { status: 403 }
      );
    }

    // Fetch employees with board roles
    const boardRoles = ["chairperson", "administrator", "fund_manager", "union_rep"];
    
    // First get profiles with board roles
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("user_id, role")
      .in("role", boardRoles);

    if (profilesError) {
      console.error("[/api/admin/board-members] Profiles error:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch board members." },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        members: [],
      });
    }

    // Get employee details for each profile
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: employees, error: employeesError } = await admin
      .from("employees")
      .select("id, first_name, last_name, email, employee_no, department, position")
      .in("id", userIds);

    if (employeesError) {
      console.error("[/api/admin/board-members] Employees error:", employeesError);
      return NextResponse.json(
        { error: "Failed to fetch board members." },
        { status: 500 }
      );
    }

    // Merge data
    const members = (employees || []).map((emp: any) => {
      const profile = profiles.find((p: any) => p.user_id === emp.id);
      return {
        ...emp,
        role: profile?.role || 'employee',
      };
    }).sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (err: any) {
    console.error("[/api/admin/board-members] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
