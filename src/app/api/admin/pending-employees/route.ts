import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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
        { error: "Only super admins can view pending employees." },
        { status: 403 }
      );
    }

    // Fetch pending employees
    const { data: employees, error: employeesError } = await admin
      .from("pending_employees")
      .select("*")
      .eq("status", "pending")
      .order("imported_at", { ascending: false });

    if (employeesError) {
      console.error("[/api/admin/pending-employees] Fetch error:", employeesError);
      return NextResponse.json(
        { error: "Failed to fetch pending employees." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      employees: employees || [],
    });
  } catch (err: any) {
    console.error("[/api/admin/pending-employees] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
