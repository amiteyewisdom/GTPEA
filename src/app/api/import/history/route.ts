import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { fetchImportHistory } from "@/lib/imports/log-import";

export async function GET() {
  const { supabase, role } = await getStaffUser();

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to view import history." }, { status: 403 });
  }

  const history = await fetchImportHistory(supabase);
  return NextResponse.json({ history });
}
