import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOTP, getOTPExpiration, formatPhoneNumber } from "@/utils/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, password } = body;

    if (!staffId || !password) {
      return NextResponse.json(
        { error: "Staff ID and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Staff ID only login flow - try employees table first
    let employee = null;
    let employeeError = null;
    let phoneNumber = null;
    let isFirstLogin = false;
    let authEmail = '';

    // Try to find in employees table
    const employeeResult = await admin
      .from("employees")
      .select("id, employee_no, phone_number, password_changed_at, email")
      .eq("employee_no", staffId)
      .single();

    employee = employeeResult.data;
    employeeError = employeeResult.error;

    if (employeeError || !employee) {
      // If not found in employees, try profiles table (for admin accounts)
      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("user_id, employee_id, phone, role")
        .eq("employee_id", staffId)
        .single();

      if (profileError || !profile) {
        return NextResponse.json(
          { error: "Invalid Staff ID or password." },
          { status: 401 }
        );
      }

      // For admin accounts, get corresponding employee record
      const { data: adminEmployee, error: adminEmployeeError } = await admin
        .from("employees")
        .select("id, employee_no, phone_number, password_changed_at, email")
        .eq("employee_no", staffId)
        .single();

      if (adminEmployeeError || !adminEmployee) {
        // Create missing employee record for admin
        const { error: createError } = await admin
          .from("employees")
          .insert({
            employee_no: staffId,
            first_name: profile.full_name?.split(' ')[0] || 'Admin',
            last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'User',
            email: `${staffId.toLowerCase()}@staff.gtpea.local`,
            phone: profile.phone || null,
            department: 'management',
            position: profile.role === 'super_admin' ? 'Super Administrator' : 'Administrator',
            bank_account_no: null,
            date_joined: new Date().toISOString().slice(0, 10),
            salary: 0,
            status: 'active',
            password_changed_at: new Date().toISOString()
          });

        if (createError) {
          return NextResponse.json(
            { error: "Failed to create admin employee record." },
            { status: 500 }
          );
        }

        // Get the newly created employee
        const { data: newEmployee } = await admin
          .from("employees")
          .select("id, employee_no, phone_number, password_changed_at, email")
          .eq("employee_no", staffId)
          .single();

        employee = newEmployee;
      } else {
        employee = adminEmployee;
      }
    }

    phoneNumber = employee.phone_number;
    isFirstLogin = !employee.password_changed_at;
    authEmail = employee.email || `${staffId.toLowerCase()}@staff.gtpea.local`;

    // Sign in with email (Supabase auth uses email)
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if first login - user needs to change password
    if (isFirstLogin) {
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
