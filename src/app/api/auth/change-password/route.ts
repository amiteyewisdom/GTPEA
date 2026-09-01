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

    console.log("[/api/auth/change-password] User data:", {
      email: user.email,
      userId: user.id,
    });

    // Update password in Supabase auth
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      console.error("[/api/auth/change-password] Auth update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log("[/api/auth/change-password] Auth password updated successfully");

    // Update employee record with phone number and mark first login as complete
    const updateData = { 
      phone_number: phoneNumber,
      is_first_login: false,
      password_changed_at: new Date().toISOString()
    };
    
    console.log("[/api/auth/change-password] Updating employee record:", {
      email: user.email,
      updateData,
    });

    const { error: employeeError, count } = await admin
      .from("employees")
      .update(updateData)
      .eq("email", user.email)
      .select();

    if (employeeError) {
      console.error("[/api/auth/change-password] Employee update error:", employeeError);
      console.error("[/api/auth/change-password] Error details:", JSON.stringify(employeeError, null, 2));
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    console.log("[/api/auth/change-password] Employee record updated successfully:", {
      count,
      affectedRows: count,
    });

    // Also update phone number in profiles table
    const { error: profileError } = await admin
      .from("profiles")
      .update({ phone: phoneNumber })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("[/api/auth/change-password] Profile update error:", profileError);
      // Don't fail the whole process if profile update fails, just log it
    } else {
      console.log("[/api/auth/change-password] Profile phone number updated successfully");
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
          phone_number: formatPhoneNumber(phoneNumber),
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
        console.error("[/api/auth/change-password] SMS API error:", smsResponse.statusText);
        return NextResponse.json(
          { error: "Failed to send SMS. Please try again." },
          { status: 500 }
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
