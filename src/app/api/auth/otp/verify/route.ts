import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OTP_COOKIE_NAME = "gtpea_otp_verified";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const body = await request.json();
  const code = String(body.code || "").trim();

  if (!code) {
    return NextResponse.json({ error: "Enter the verification code." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await (supabase
    .from("profiles")
    .select("otp_code, otp_expires_at")
    .eq("user_id", user.id)
    .single() as any);

  if (profileError || !profile) {
    return NextResponse.json({ error: "Could not load your profile." }, { status: 500 });
  }

  if (!profile.otp_code || !profile.otp_expires_at) {
    return NextResponse.json({ error: "No verification code was requested. Please request a new code." }, { status: 400 });
  }

  if (new Date(profile.otp_expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  if (profile.otp_code !== code) {
    return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
  }

  const { error: updateError } = await (supabase
    .from("profiles") as any)
    .update({ otp_code: null, otp_expires_at: null, otp_verified_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const response = NextResponse.json({ message: "Verified." });
  response.cookies.set(OTP_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
