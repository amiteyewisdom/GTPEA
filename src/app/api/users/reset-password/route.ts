import { NextResponse } from "next/server";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_USER_PASSWORD } from "@/lib/imports/process-users";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManageUsers(role)) {
    return NextResponse.json({ error: "Only Admins can reset passwords." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = body.userId as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      password: DEFAULT_USER_PASSWORD,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await (adminClient.from("profiles") as any)
      .update({ must_change_password: true, phone: null })
      .eq("user_id", userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Clear the employee phone too so the setup flow asks for the number again
    const { data: prof } = await (adminClient.from("profiles") as any)
      .select("employee_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (prof?.employee_id) {
      await (adminClient.from("employees") as any)
        .update({ phone: null, phone_number: null, password_changed_at: null, is_first_login: true })
        .eq("id", prof.employee_id);
    }

    return NextResponse.json({ message: "Password reset to the default password. The user will set a new password and phone number on next login." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset password." },
      { status: 500 }
    );
  }
}
