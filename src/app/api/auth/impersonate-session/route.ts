import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { impersonationToken } = await request.json();

    if (!impersonationToken) {
      return NextResponse.json({ error: "Impersonation token is required." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Find the impersonation session
    const { data: session, error: sessionError } = await adminSupabase
      .from("impersonation_sessions")
      .select("*")
      .eq("session_token", impersonationToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid or expired impersonation token." }, { status: 401 });
    }

    // Get the target user's profile
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.target_user_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Get the employee data
    const { data: employee } = await adminSupabase
      .from("employees")
      .select("*")
      .eq("id", session.target_employee_id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: session.target_user_id,
        email: profile.email,
        role: profile.role,
        employee_id: session.target_employee_id,
      },
      employee,
      expires_at: session.expires_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate impersonation." },
      { status: 500 }
    );
  }
}
