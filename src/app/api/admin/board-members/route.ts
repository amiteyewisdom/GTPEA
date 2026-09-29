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
      console.log("[/api/admin/board-members] No profiles found with board roles");
      return NextResponse.json({
        success: true,
        members: [],
      });
    }

    console.log("[/api/admin/board-members] Found profiles:", profiles.length);

    // Get auth users to get their emails
    const userIds = profiles.map((p: any) => p.user_id);
    const authUsersMap = new Map<string, string>();
    let page = 1;
    const maxPages = 10;
    
    while (page <= maxPages) {
      const { data: authUsers } = await admin.auth.admin.listUsers({
        page: page,
        perPage: 100,
      });
      
      authUsers.users.forEach((u: any) => {
        if (userIds.includes(u.id)) {
          authUsersMap.set(u.id, u.email);
        }
      });
      
      if (authUsers.users.length < 100) {
        break;
      }
      page++;
    }

    // Get employee details by matching email
    const emails = Array.from(authUsersMap.values());
    const { data: employees, error: employeesError } = await admin
      .from("employees")
      .select("id, first_name, last_name, email, employee_no, department, position")
      .in("email", emails);

    if (employeesError) {
      console.error("[/api/admin/board-members] Employees error:", employeesError);
      return NextResponse.json(
        { error: "Failed to fetch board members." },
        { status: 500 }
      );
    }

    // Merge data by email
    const members = (employees || []).map((emp: any) => {
      // Find the profile by matching auth user email to employee email
      const profile = profiles.find((p: any) => authUsersMap.get(p.user_id) === emp.email);
      return {
        ...emp,
        role: profile?.role || null,
      };
    });

    console.log("[/api/admin/board-members] Results:", { 
      profilesCount: profiles.length, 
      employeesCount: employees.length, 
      membersCount: members.length,
      sampleMember: members[0]
    });

    const filteredMembers = members
      .filter((m: any) => m.role !== null)
      .sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));

    return NextResponse.json({
      success: true,
      members: filteredMembers,
    });
  } catch (err: any) {
    console.error("[/api/admin/board-members] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
