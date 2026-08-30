import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOTP, getOTPExpiration, formatPhoneNumber } from "@/utils/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, userId } = body;

    if (!phoneNumber || !userId) {
      return NextResponse.json(
        { error: "Phone number and user ID are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration(5); // 5 minutes expiration

    // Store OTP in database (create or update otp_codes table)
    const { error: otpError } = await admin
      .from("otp_codes")
      .upsert({
        user_id: userId,
        phone_number: formatPhoneNumber(phoneNumber),
        code: otp,
        expires_at: expiresAt.toISOString(),
        is_used: false,
        created_at: new Date().toISOString(),
      });

    if (otpError) {
      console.error("[/api/otp/send] Database error:", otpError);
      return NextResponse.json(
        { error: "Failed to store OTP code." },
        { status: 500 }
      );
    }

    // Send SMS with OTP
    const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: formatPhoneNumber(phoneNumber),
        message: `Your GTP verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`,
      }),
    });

    const smsData = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error("[/api/otp/send] SMS error:", smsData);
      return NextResponse.json(
        { error: "Failed to send SMS. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[/api/otp/send] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
