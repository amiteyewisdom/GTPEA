import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOTP, getOTPExpiration, formatPhoneNumber } from "@/utils/otp";

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
        .select("id, email, employee_no, is_first_login, phone_number, password_changed_at")
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
      
      // Debug logging
      console.log("[/api/auth/login] Employee data:", {
        employee_no: employee.employee_no,
        is_first_login: employee.is_first_login,
        password_changed_at: employee.password_changed_at,
        calculated_isFirstLogin: !employee.password_changed_at,
      });
      
      // Use database field to determine if first login
      // If password_changed_at is null, user hasn't changed password yet
      isFirstLogin = !employee.password_changed_at;
      isEmployee = true;

      console.log("[/api/auth/login] Decision for employee login:", {
        isFirstLogin,
        phoneNumber: phoneNumber ? "present" : "missing",
        willRedirectTo: isFirstLogin ? "change-password" : (phoneNumber ? "OTP" : "setup-phone"),
      });
    } else {
      // Non-employee (email) login flow
      email = identifier;
      
      // Check if this email belongs to an employee
      const { data: employee } = await admin
        .from("employees")
        .select("id, email, employee_no, is_first_login, phone_number, password_changed_at")
        .eq("email", email)
        .maybeSingle();

      if (employee) {
        // This is an employee logging in with email
        phoneNumber = employee.phone_number;
        
        // Debug logging
        console.log("[/api/auth/login] Employee data (email login):", {
          email: employee.email,
          is_first_login: employee.is_first_login,
          password_changed_at: employee.password_changed_at,
          calculated_isFirstLogin: !employee.password_changed_at,
        });
        
        // Use database field to determine if first login
        // If password_changed_at is null, user hasn't changed password yet
        isFirstLogin = !employee.password_changed_at;
        isEmployee = true;

        console.log("[/api/auth/login] Decision for email login:", {
          isFirstLogin,
          phoneNumber: phoneNumber ? "present" : "missing",
          willRedirectTo: isFirstLogin ? "change-password" : (phoneNumber ? "OTP" : "setup-phone"),
        });
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

    // Check if first login (employees only) - user needs to change password
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

    // User has already changed password and has phone number - send OTP only
    try {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiration(5); // 5 minutes expiration

      // Store OTP in database
      const { error: otpError } = await admin
        .from("otp_codes")
        .upsert({
          user_id: authData.user.id,
          phone_number: formatPhoneNumber(phoneNumber),
          code: otp,
          expires_at: expiresAt.toISOString(),
          is_used: false,
          created_at: new Date().toISOString(),
        });

      if (otpError) {
        console.error("[/api/auth/login] Database error:", otpError);
        return NextResponse.json(
          { error: "Failed to store OTP code." },
          { status: 500 }
        );
      }

      // Send SMS with OTP using Nalo SMS API directly
      const authKey = process.env.NALO_SMS_AUTH_KEY;
      const senderId = process.env.NALO_SMS_SENDER_ID || "GTP";

      if (!authKey) {
        console.error("[/api/auth/login] SMS authentication key not configured");
        return NextResponse.json(
          { error: "SMS service not configured. Please contact administrator." },
          { status: 500 }
        );
      }

      // Format phone number to international format (Ghana: +233)
      let formattedPhone = formatPhoneNumber(phoneNumber);
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "233" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("233")) {
        formattedPhone = "233" + formattedPhone;
      }

      // Build URL with query parameters for Nalo SMS
      const baseUrl = "https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/";
      const params = new URLSearchParams({
        key: authKey,
        type: "0",
        destination: formattedPhone,
        dlr: "1",
        source: senderId,
        message: `Your GTP verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`,
      });

      const url = `${baseUrl}?${params.toString()}`;

      // Send SMS using fetch
      const smsResponse = await fetch(url);

      if (!smsResponse.ok) {
        console.error("[/api/auth/login] SMS API error:", smsResponse.statusText);
        return NextResponse.json(
          { error: "Failed to send SMS. Please try again." },
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
