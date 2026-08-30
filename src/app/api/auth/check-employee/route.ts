import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, email } = body;

    if (!employeeId || !email) {
      return NextResponse.json(
        { error: "Employee ID and email are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Check if employee exists and is approved in pending_employees
    const { data: pendingEmployee, error: pendingError } = await admin
      .from("pending_employees")
      .select("*")
      .eq("employee_no", employeeId)
      .eq("email", email)
      .eq("status", "approved")
      .single();

    if (!pendingError && pendingEmployee) {
      return NextResponse.json({
        approved: true,
        message: "Employee approved for registration",
      });
    }

    // Check if employee already exists in employees table
    const { data: existingEmployee, error: existingError } = await admin
      .from("employees")
      .select("*")
      .eq("employee_no", employeeId)
      .eq("email", email)
      .single();

    if (!existingError && existingEmployee) {
      return NextResponse.json({
        approved: true,
        message: "Employee already exists in system",
      });
    }

    return NextResponse.json({
      approved: false,
      message: "Employee not found or not approved",
    });
  } catch (err: any) {
    console.error("[/api/auth/check-employee] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
