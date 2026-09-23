import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { fetchImportHistory } from "@/lib/imports/log-import";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { supabase, role } = await getStaffUser();

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to view import history." }, { status: 403 });
  }

  const history = await fetchImportHistory(supabase);
  return NextResponse.json({ history });
}

export async function DELETE() {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to clear import history." }, { status: 401 });
  }

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to clear import history." }, { status: 403 });
  }

  try {
    const adminSupabase = createAdminClient();
    
    // Delete all bulk import audit logs
    const { error } = await adminSupabase
      .from("audit_logs")
      .delete()
      .eq("action", "bulk_import");

    if (error) {
      console.error('[Clear Import History Error]', error);
      return NextResponse.json(
        { error: "Failed to clear import history." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Import history cleared successfully."
    });
  } catch (error) {
    console.error('[Clear Import History Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear import history." },
      { status: 500 }
    );
  }
}
