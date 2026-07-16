import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { logImportRun } from "@/lib/imports/log-import";
import { processImport, type ImportType } from "@/lib/imports/process-import";
import { createAdminClient } from "@/lib/supabase/admin";

const IMPORT_TYPES = ["employees", "savings", "loans"] as const;

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to import data." }, { status: 401 });
  }

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to import data." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as ImportType;

    if (!file) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }

    if (!IMPORT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Unknown import type." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const text = await file.text();
    const result = await processImport(adminSupabase, type, text, user.id);

    await logImportRun(adminSupabase, user.id, type, file.name, result);

    return NextResponse.json({
      message: "Import finished.",
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed." },
      { status: 500 }
    );
  }
}
