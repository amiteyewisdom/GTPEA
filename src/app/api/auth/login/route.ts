import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Employee ID or email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Detect if identifier is Employee ID or email
    const isEmployeeId = !identifier.includes("@");

    let email: string;
    let phoneNumber: string | null = null;
    let isFirstLogin = false;
    let isEmployee = false;

    if (isEmployeeId) {
      // Employee login flow
      const { data: employee, error: employeeError } = await admin
        .from("employees")
        .select("id, email, is_first_login, phone_number")
        .eq("employee_no", identifier)
        .single();

      if (employeeError || !employee) {
        return NextResponse.json(
          { error: "Invalid Employee ID or password." },
          { status: 401 }
        );
      }

      email = employee.email;
      phoneNumber = employee.phone_number;
      isFirstLogin = employee.is_first_login;
      isEmployee = true;
    } else {
      // Non-employee (email) login flow
      email = identifier;
      
      // Check if this email belongs to an employee
      const { data: employee } = await admin
        .from("employees")
        .select("id, is_first_login, phone_number")
        .eq("email", email)
        .maybeSingle();

      if (employee) {
        // This is an employee logging in with email
        phoneNumber = employee.phone_number;
        isFirstLogin = employee.is_first_login;
        isEmployee = true;
      } else {
        // Non-employee: get phone number from profiles
        const { data: profile } = await admin
          .from("profiles")
          .select("phone_number")
          .eq("email", email)
          .maybeSingle();

        phoneNumber = profile?.phone_number || null;
        isFirstLogin = false; // Non-employees don't have first login flow
        isEmployee = false;
      }
    }

    // Sign in with email (Supabase auth uses email)
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if first login (employees only)
    if (isEmployee && isFirstLogin) {
      return NextResponse.json({
        success: true,
        isFirstLogin: true,
        message: "First login detected. Please change your password.",
      });
    }

    // Check if phone number exists for OTP
    if (!phoneNumber) {
      return NextResponse.json({
        success: true,
        requiresPhoneSetup: true,
        message: "Please set up your phone number for OTP verification.",
      });
    }

    // Send OTP
    try {
      const otpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          userId: authData.user.id,
        }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        console.error("[/api/auth/login] OTP send error:", otpData);
        return NextResponse.json(
          { error: "Failed to send OTP. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        requiresOtp: true,
        message: "OTP sent successfully",
      });
    } catch (err) {
      console.error("[/api/auth/login] OTP error:", err);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[/api/auth/login] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
