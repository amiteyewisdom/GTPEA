import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const employee = await getLoggedInEmployee(supabase);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found." },
        { status: 400 }
      );
    }

    // Check if user is a board member or admin - they cannot be guarantors
    const adminClient = createAdminClient();
    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("user_id", employee.userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to check user role." },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    const profile = profileData as { role: string };
    const restrictedRoles = ["super_admin", "administrator", "chairperson", "fund_manager"];
    
    if (restrictedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Board members and administrators cannot apply to become guarantors." },
        { status: 403 }
      );
    }

    // Check if already has a guarantor status
    const existingRes = await supabase
      .from("employees")
      .select("guarantor_status, is_blacklisted")
      .eq("id", employee.employeeId)
      .single();

    if (existingRes.error) {
      return NextResponse.json(
        { error: "Failed to check guarantor status." },
        { status: 500 }
      );
    }

    const existing = existingRes.data as { guarantor_status: string | null; is_blacklisted: boolean | null };
    if (existing.is_blacklisted) {
      return NextResponse.json(
        { error: "You are blacklisted from becoming a guarantor. Please contact the union representative for more information." },
        { status: 400 }
      );
    }
    if (existing.guarantor_status && existing.guarantor_status !== "suspended") {
      return NextResponse.json(
        { error: "You already have a pending or approved guarantor application." },
        { status: 400 }
      );
    }

    // Get employee name for notification
    const employeeRes = await adminClient
      .from("employees")
      .select("first_name, last_name")
      .eq("id", employee.employeeId)
      .single();

    const employeeData = employeeRes.data as { first_name: string; last_name: string } | null;
    const employeeName = employeeData ? `${employeeData.first_name} ${employeeData.last_name}` : "An employee";

    // Update employee with pending guarantor status
    const updateRes = await adminClient
      .from("employees")
      .update({
        guarantor_status: "pending",
        guarantor_application_date: new Date().toISOString(),
        guarantor_notes: null,
      })
      .eq("id", employee.employeeId);

    if (updateRes.error) {
      return NextResponse.json(
        { error: updateRes.error.message },
        { status: 500 }
      );
    }

    // Notify union reps about the application
    const unionRepsRes = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("role", "union_rep");

    if (unionRepsRes.data) {
      const notifications = unionRepsRes.data.map((rep: any) => ({
        user_id: rep.user_id,
        type: "guarantor_application",
        title: "New Guarantor Application",
        message: `${employeeName} has applied to become a guarantor.`,
        related_type: "employee",
        related_id: employee.employeeId,
      }));

      if (notifications.length > 0) {
        await adminClient.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({
      message: "Guarantor application submitted successfully.",
    });
  } catch (err: any) {
    console.error("[/api/guarantors/apply] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
