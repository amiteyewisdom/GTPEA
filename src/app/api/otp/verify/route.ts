import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and OTP code are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get the latest OTP for this user
    const { data: otpData, error: otpError } = await admin
      .from("otp_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpData.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify the code
    if (otpData.code !== code) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await admin
      .from("otp_codes")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("[/api/otp/verify] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to verify OTP." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err: any) {
    console.error("[/api/otp/verify] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
