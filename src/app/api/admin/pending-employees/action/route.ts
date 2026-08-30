import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "ID and action are required." },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action." },
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
        { error: "Only super admins can approve employees." },
        { status: 403 }
      );
    }

    // Get the pending employee
    const { data: pendingEmployee, error: fetchError } = await admin
      .from("pending_employees")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !pendingEmployee) {
      return NextResponse.json(
        { error: "Pending employee not found." },
        { status: 404 }
      );
    }

    if (action === 'reject') {
      // Update status to rejected
      const { error: rejectError } = await admin
        .from("pending_employees")
        .update({ 
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (rejectError) {
        return NextResponse.json(
          { error: "Failed to reject employee." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Employee rejected successfully",
      });
    }

    if (action === 'approve') {
      // Update status to approved
      const { error: approveError } = await admin
        .from("pending_employees")
        .update({ 
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (approveError) {
        return NextResponse.json(
          { error: "Failed to approve employee." },
          { status: 500 }
        );
      }

      // Create employee record
      const { error: employeeError } = await admin
        .from("employees")
        .insert({
          employee_no: pendingEmployee.employee_no,
          email: pendingEmployee.email,
          phone_number: pendingEmployee.phone_number,
          first_name: pendingEmployee.first_name,
          last_name: pendingEmployee.last_name,
          is_first_login: true,
        });

      if (employeeError) {
        console.error("[/api/admin/pending-employees/action] Employee insert error:", employeeError);
        return NextResponse.json(
          { error: "Failed to create employee record." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Employee approved and created successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[/api/admin/pending-employees/action] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
