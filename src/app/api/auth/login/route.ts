import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOTP, getOTPExpiration, formatPhoneNumber } from "@/utils/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[/api/auth/login] Received body:', body);
    
    // Support both old format (identifier) and new format (staffId)
    const { staffId, identifier, password } = body;
    const loginId = staffId || identifier;

    if (!loginId || !password) {
      console.log('[/api/auth/login] Missing credentials:', { loginId: !!loginId, password: !!password });
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

    console.log('[/api/auth/login] Looking up employee with:', loginId);

    // Try to find in employees table
    const employeeResult = await admin
      .from("employees")
      .select("id, employee_no, phone_number, password_changed_at, email")
      .eq("employee_no", loginId)
      .single();

    employee = employeeResult.data;
    employeeError = employeeResult.error;

    if (employeeError || !employee) {
      console.log('[/api/auth/login] Employee not found, trying profiles table');
      
      // If not found in employees, try profiles table (for admin accounts)
      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("user_id, employee_id, phone, role, full_name")
        .eq("employee_id", loginId)
        .single();

      if (profileError || !profile) {
        console.log('[/api/auth/login] Profile not found either:', profileError?.message);
        return NextResponse.json(
          { error: "Invalid Staff ID or password." },
          { status: 401 }
        );
      }

      console.log('[/api/auth/login] Found profile:', profile.role);

      // For admin accounts, get corresponding employee record
      const { data: adminEmployee, error: adminEmployeeError } = await admin
        .from("employees")
        .select("id, employee_no, phone_number, password_changed_at, email")
        .eq("employee_no", loginId)
        .single();

      if (adminEmployeeError || !adminEmployee) {
        console.log('[/api/auth/login] Creating employee record for admin');
        
        // Create missing employee record for admin
        const { error: createError } = await admin
          .from("employees")
          .insert({
            employee_no: loginId,
            first_name: profile.full_name?.split(' ')[0] || 'Admin',
            last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'User',
            email: `${loginId.toLowerCase()}@staff.gtpea.local`,
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
          console.log('[/api/auth/login] Failed to create employee:', createError.message);
          return NextResponse.json(
            { error: "Failed to create admin employee record." },
            { status: 500 }
          );
        }

        // Get the newly created employee
        const { data: newEmployee } = await admin
          .from("employees")
          .select("id, employee_no, phone_number, password_changed_at, email")
          .eq("employee_no", loginId)
          .single();

        employee = newEmployee;
      } else {
        employee = adminEmployee;
      }
    }

    phoneNumber = employee.phone_number;
    isFirstLogin = !employee.password_changed_at;
    authEmail = employee.email || `${loginId.toLowerCase()}@staff.gtpea.local`;

    console.log('[/api/auth/login] Attempting auth with email:', authEmail);

    // Try to sign in first
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    // If auth user doesn't exist, create it with default password
    if (signInError && signInError.message.includes("Invalid login credentials")) {
      console.log('[/api/auth/login] Auth user not found, creating account with default password');
      
      try {
        const { data: newAuthData, error: createError } = await admin.auth.admin.createUser({
          email: authEmail,
          password: "Gtpea@2026", // Universal default password
          email_confirm: true,
          user_metadata: {
            staff_id: loginId,
            employee_no: loginId,
            full_name: `${employee.first_name} ${employee.last_name}`,
            phone_number: phoneNumber
          }
        });

        if (createError) {
          console.log('[/api/auth/login] Failed to create auth account:', createError.message);
          return NextResponse.json(
            { error: "Failed to create account. Please contact administrator." },
            { status: 500 }
          );
        }

        console.log('[/api/auth/login] Created auth account, attempting login again');
        
        // Try login again with the newly created account
        const { data: retryAuthData, error: retryError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (retryError) {
          console.log('[/api/auth/login] Retry login failed:', retryError.message);
          return NextResponse.json(
            { error: "Account created but login failed. Please try again." },
            { status: 401 }
          );
        }

        // Force first login for newly created accounts
        return NextResponse.json({
          success: true,
          isFirstLogin: true,
          message: "Account created. Please change your password.",
        });
      } catch (createError) {
        console.error('[/api/auth/login] Account creation error:', createError);
        return NextResponse.json(
          { error: "Failed to create account. Please contact administrator." },
          { status: 500 }
        );
      }
    }

    if (signInError) {
      console.log('[/api/auth/login] Auth failed:', signInError.message);
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Use the auth data from either the initial login or the retry after account creation
    const finalAuthData = retryAuthData || authData;

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
          user_id: finalAuthData.user.id,
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
