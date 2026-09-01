import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const employee = await getLoggedInEmployee(supabase);

    console.log("[/api/guarantors/apply] Employee data:", employee);

    if (!employee) {
      console.error("[/api/guarantors/apply] Employee profile not found");
      return NextResponse.json(
        { error: "Employee profile not found." },
        { status: 400 }
      );
    }

    // Check if already has a guarantor status
    const existingRes = await supabase
      .from("employees")
      .select("guarantor_status, is_blacklisted")
      .eq("id", employee.employeeId)
      .single();

    if (existingRes.error) {
      console.error("[/api/guarantors/apply] Failed to check guarantor status:", existingRes.error);
      return NextResponse.json(
        { error: "Failed to check guarantor status." },
        { status: 500 }
      );
    }

    const existing = existingRes.data as { guarantor_status: string | null; is_blacklisted: boolean | null };
    console.log("[/api/guarantors/apply] Existing status:", existing);

    if (existing.is_blacklisted) {
      console.error("[/api/guarantors/apply] User is blacklisted");
      return NextResponse.json(
        { error: "You are blacklisted from becoming a guarantor. Please contact the union representative for more information." },
        { status: 400 }
      );
    }
    if (existing.guarantor_status && existing.guarantor_status !== "suspended") {
      console.error("[/api/guarantors/apply] Already has guarantor status:", existing.guarantor_status);
      return NextResponse.json(
        { error: "You already have a pending or approved guarantor application." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get employee name for notification
    const employeeRes = await admin
      .from("employees")
      .select("first_name, last_name")
      .eq("id", employee.employeeId)
      .single();

    const employeeData = employeeRes.data as { first_name: string; last_name: string } | null;
    const employeeName = employeeData ? `${employeeData.first_name} ${employeeData.last_name}` : "An employee";

    // Update employee with pending guarantor status
    const updateRes = await admin
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
    const unionRepsRes = await admin
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
        await admin.from("notifications").insert(notifications);
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
