import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canImpersonate, getStaffUser } from "@/lib/api/staff-auth";
import { getSystemFlags } from "@/lib/api/system-settings";

const VALID_KEYS = new Set(["logins_locked", "maintenance_mode"]);

export async function GET() {
  const { user, role } = await getStaffUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  if (!canImpersonate(role)) {
    return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  }
  return NextResponse.json(await getSystemFlags(createAdminClient()));
}

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  if (!canImpersonate(role)) {
    return NextResponse.json({ error: "Only the super admin can change system controls." }, { status: 403 });
  }

  try {
    const { key, enabled } = await request.json();
    if (!VALID_KEYS.has(key) || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await (admin.from("system_settings") as any)
      .upsert({
        key,
        value: enabled,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await (admin.from("audit_logs") as any).insert({
      action: enabled ? "SYSTEM_CONTROL_ENABLED" : "SYSTEM_CONTROL_DISABLED",
      entity_type: "system_settings",
      entity_id: key,
      performed_by: user.id,
      details: { key, enabled },
    });

    return NextResponse.json({ success: true, key, enabled });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update system control." },
      { status: 500 }
    );
  }
}
