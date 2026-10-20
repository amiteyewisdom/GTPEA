import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOTP, getOTPExpiration, formatPhoneNumber } from "@/utils/otp";

// Sends an OTP to the logged-in user's REGISTERED phone. The phone number and
// user id are resolved server-side — trusting them from the request body let
// anyone trigger SMS to arbitrary numbers or codes for arbitrary users.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // Resolve the registered phone server-side (employee -> profile fallback)
    let phoneNumber: string | null = null;
    if (user.email) {
      const { data: emp } = await (admin.from("employees") as any)
        .select("phone, phone_number")
        .eq("email", user.email)
        .maybeSingle();
      phoneNumber = emp?.phone_number || emp?.phone || null;

      if (!phoneNumber && user.email.includes("@staff.gtpea.local")) {
        const staffId = user.email.split("@")[0];
        const { data: empByNo } = await (admin.from("employees") as any)
          .select("phone, phone_number")
          .ilike("employee_no", staffId)
          .maybeSingle();
        phoneNumber = empByNo?.phone_number || empByNo?.phone || null;
      }
    }
    if (!phoneNumber) {
      const { data: profile } = await (admin.from("profiles") as any)
        .select("phone")
        .eq("user_id", user.id)
        .maybeSingle();
      phoneNumber = profile?.phone || null;
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "No registered phone number on this account. Please contact support." },
        { status: 400 }
      );
    }

    // Resend throttling — no new code within 60s, max 5 sends per hour
    const { data: recent } = await admin
      .from("otp_codes")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const now = Date.now();
    if (recent?.length) {
      const latest = new Date(recent[0].created_at).getTime();
      if (now - latest < 60_000) {
        return NextResponse.json(
          { error: "A code was just sent. Please wait a minute before requesting another." },
          { status: 429 }
        );
      }
      const hourAgo = now - 60 * 60 * 1000;
      const sentThisHour = recent.filter((r: any) => new Date(r.created_at).getTime() > hourAgo).length;
      if (sentThisHour >= 5) {
        return NextResponse.json(
          { error: "Too many code requests. Please try again later or contact support." },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration(5); // 5 minutes expiration

    const { error: otpError } = await admin
      .from("otp_codes")
      .insert({
        user_id: user.id,
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

    // Send SMS with OTP using Nalo SMS API directly
    const authKey = process.env.NALO_SMS_AUTH_KEY;
    const senderId = process.env.NALO_SMS_SENDER_ID || "GTP";

    if (!authKey) {
      console.error("[/api/otp/send] SMS authentication key not configured");
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

    const smsResponse = await fetch(url);
    const raw = await smsResponse.text();
    console.log("[/api/otp/send] Nalo response:", smsResponse.status, raw);

    if (!smsResponse.ok || (!raw.includes("1701") && !raw.toLowerCase().includes("success"))) {
      return NextResponse.json(
        { error: "Failed to send SMS. Please try again." },
        { status: 502 }
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
