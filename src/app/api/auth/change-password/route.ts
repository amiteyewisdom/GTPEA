import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, phoneNumber } = body;

    if (!password || !phoneNumber) {
      return NextResponse.json(
        { error: "Password and phone number are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (phoneNumber.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("[/api/auth/change-password] Session error:", userError);
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Update password in Supabase auth
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // If the account already has a registered phone, it wins — the OTP must
    // go to the number on record, not whatever was submitted. A locked form
    // field is UI-only; enforcing it here closes an account-takeover path
    // where an attacker swaps in their own number to receive the OTP.
    let registeredPhone: string | null = null;
    const { data: ownEmployee } = await (admin.from("employees") as any)
      .select("phone, phone_number")
      .eq("email", user.email)
      .maybeSingle();
    registeredPhone = ownEmployee?.phone_number || ownEmployee?.phone || null;
    const effectivePhone = registeredPhone || phoneNumber;

    // Check if phone number is already used by another employee (skipped when
    // reusing the registered number — it already belongs to this account)
    if (effectivePhone !== registeredPhone) {
      const { data: existingEmployee } = await admin
        .from("employees")
        .select("id, email")
        .eq("phone_number", effectivePhone)
        .neq("email", user.email)
        .maybeSingle();

      if (existingEmployee) {
        return NextResponse.json(
          { error: "This phone number is already registered to another account." },
          { status: 400 }
        );
      }

      // Check if phone number is already used in profiles
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("phone", effectivePhone)
        .neq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: "This phone number is already registered to another account." },
          { status: 400 }
        );
      }
    }

    // Update employee record with phone number and mark first login as complete
    const updateData = {
      phone: effectivePhone,
      phone_number: effectivePhone,
      is_first_login: false,
      password_changed_at: new Date().toISOString()
    };

    const { error: employeeError } = await admin
      .from("employees")
      .update(updateData)
      .eq("email", user.email);

    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    // Also update phone number in profiles table and clear the forced
    // password-change flag — without this the proxy redirects the user back
    // to /change-password on every request after an admin account reset.
    const { error: profileError } = await admin
      .from("profiles")
      .update({ phone: effectivePhone, must_change_password: false, otp_verified_at: null })
      .eq("user_id", user.id);

    if (profileError) {
      // Don't fail the whole process if profile update fails, just log it
      console.error("[/api/auth/change-password] Profile update error:", profileError);
    }

    // Send OTP
    try {
      const { generateOTP, getOTPExpiration, formatPhoneNumber } = await import("@/utils/otp");
      
      const otp = generateOTP();
      const expiresAt = getOTPExpiration(5); // 5 minutes expiration

      // Store OTP in database
      const { error: otpError } = await admin
        .from("otp_codes")
        .upsert({
          user_id: user.id,
          phone_number: formatPhoneNumber(effectivePhone),
          code: otp,
          expires_at: expiresAt.toISOString(),
          is_used: false,
          created_at: new Date().toISOString(),
        });

      if (otpError) {
        console.error("[/api/auth/change-password] Database error:", otpError);
        return NextResponse.json(
          { error: "Failed to store OTP code." },
          { status: 500 }
        );
      }

      // Send SMS with OTP using Nalo SMS API directly
      const authKey = process.env.NALO_SMS_AUTH_KEY;
      const senderId = process.env.NALO_SMS_SENDER_ID || "GTP";

      if (!authKey) {
        console.error("[/api/auth/change-password] SMS authentication key not configured");
        return NextResponse.json(
          { error: "SMS service not configured. Please contact administrator." },
          { status: 500 }
        );
      }

      // Format phone number to international format (Ghana: +233)
      let formattedPhone = formatPhoneNumber(effectivePhone);
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
      const raw = await smsResponse.text();
      // Nalo returns HTTP 200 even on failure — check the body for the real
      // status (success responses typically start with "1701").
      console.log("[/api/auth/change-password] Nalo response:", smsResponse.status, raw);

      if (!smsResponse.ok || (!raw.includes("1701") && !raw.toLowerCase().includes("success"))) {
        return NextResponse.json(
          { error: "Password changed, but the verification SMS failed to send. Try again from the verification page." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password updated and OTP sent successfully",
      });
    } catch (err) {
      console.error("[/api/auth/change-password] OTP error:", err);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[/api/auth/change-password] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
