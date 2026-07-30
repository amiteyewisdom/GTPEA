import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSms, isNaloConfigured } from "@/lib/sms/nalo";

const OTP_TTL_MINUTES = 10;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await (supabase
    .from("profiles")
    .select("phone, full_name")
    .eq("user_id", user.id)
    .single() as any);

  if (profileError || !profile) {
    return NextResponse.json({ error: "Could not load your profile." }, { status: 500 });
  }

  if (!profile.phone) {
    return NextResponse.json(
      { error: "No phone number on file. Contact an administrator to enable 2-step verification." },
      { status: 400 }
    );
  }

  if (!isNaloConfigured()) {
    return NextResponse.json(
      { error: "SMS verification is not configured on the server yet." },
      { status: 503 }
    );
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const { error: updateError } = await (supabase
    .from("profiles") as any)
    .update({ otp_code: code, otp_expires_at: expiresAt, otp_verified_at: null })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const result = await sendSms(profile.phone, `Your GTPEA Finance verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Could not send verification code." }, { status: 502 });
  }

  const maskedPhone = profile.phone.replace(/\d(?=\d{2})/g, "•");

  return NextResponse.json({ message: `Verification code sent to ${maskedPhone}.` });
}
