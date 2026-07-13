import { NextResponse } from "next/server";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";
import { importUsers } from "@/lib/imports/process-users";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManageUsers(role)) {
    return NextResponse.json({ error: "Only Super Admins can import users." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Choose a CSV file to upload." }, { status: 400 });
    }

    const text = await file.text();
    const result = await importUsers(text);

    return NextResponse.json({
      message: "User import finished.",
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
