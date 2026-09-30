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

    // Fetch employees with board roles directly from employees table, excluding test admin users
    const boardRoles = ["chairperson", "administrator", "fund_manager", "union_rep"];
    
    const { data: employees, error } = await admin
      .from("employees")
      .select("id, first_name, last_name, email, employee_no, department, position, role")
      .in("role", boardRoles)
      .not("employee_no", "in", "(ADMIN001,ADMIN002)")
      .order("first_name", { ascending: true });

    if (error) {
      console.error("[/api/admin/board-members] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch board members." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      members: employees || [],
    });
  } catch (err: any) {
    console.error("[/api/admin/board-members] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
