import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, action, notes } = body;

    if (!employee_id || !action) {
      return NextResponse.json(
        { error: "Employee ID and action are required." },
        { status: 400 }
      );
    }

    if (!["approved", "suspended", "blacklisted"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved', 'suspended', or 'blacklisted'." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const approver = await getLoggedInEmployee(supabase);

    if (!approver) {
      return NextResponse.json(
        { error: "Approver profile not found." },
        { status: 400 }
      );
    }

    // Check if approver has permission
    const profileRes = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", approver.userId)
      .single();

    const profile = profileRes.data as { role: string } | null;
    const role = profile?.role || "employee";

    if (role !== "union_rep" && role !== "administrator" && role !== "super_admin") {
      return NextResponse.json(
        { error: "You don't have permission to approve guarantor applications." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // Get employee details for notification
    const employeeRes = await admin
      .from("employees")
      .select("id, user_id, first_name, last_name")
      .eq("id", employee_id)
      .single();

    if (employeeRes.error || !employeeRes.data) {
      console.error("[/api/guarantors/approve] Employee lookup error:", employeeRes.error);
      console.error("[/api/guarantors/approve] Looking for employee_id:", employee_id);
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    const employee = employeeRes.data as { id: string; user_id: string; first_name: string; last_name: string };

    // Update guarantor status
    const updateData: any = {
      guarantor_status: action,
      guarantor_approved_by: approver.employeeId,
      guarantor_approved_at: new Date().toISOString(),
      guarantor_notes: notes || null,
    };

    // Handle blacklist specific fields
    if (action === "blacklisted") {
      updateData.is_blacklisted = true;
      updateData.blacklisted_at = new Date().toISOString();
      updateData.blacklisted_by = approver.employeeId;
      updateData.blacklist_reason = notes || null;
    }

    const updateRes = await admin
      .from("employees")
      .update(updateData)
      .eq("id", employee_id);

    if (updateRes.error) {
      return NextResponse.json(
        { error: updateRes.error.message },
        { status: 500 }
      );
    }

    // Notify the employee about the decision
    let notificationType, notificationTitle, notificationMessage;
    if (action === "approved") {
      notificationType = "guarantor_approved";
      notificationTitle = "Guarantor Application Approved";
      notificationMessage = "Your application to become a guarantor has been approved.";
    } else if (action === "blacklisted") {
      notificationType = "guarantor_blacklisted";
      notificationTitle = "Guarantor Application Blacklisted";
      notificationMessage = `Your application to become a guarantor has been blacklisted. ${notes ? `Reason: ${notes}` : ""} You cannot apply to be a guarantor again unless this is reversed.`;
    } else {
      notificationType = "guarantor_rejected";
      notificationTitle = "Guarantor Application Rejected";
      notificationMessage = `Your application to become a guarantor has been rejected. ${notes ? `Reason: ${notes}` : ""}`;
    }

    await admin.from("notifications").insert({
      user_id: employee.user_id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      related_type: "employee",
      related_id: employee_id,
    });

    return NextResponse.json({
      message: action === "approved"
        ? "Guarantor application approved successfully."
        : action === "blacklisted"
        ? "Guarantor application blacklisted successfully."
        : "Guarantor application rejected successfully.",
    });
  } catch (err: any) {
    console.error("[/api/guarantors/approve] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
