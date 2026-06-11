import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { getImportTemplate, type ImportType } from "@/lib/imports/process-import";

const IMPORT_TYPES = ["employees", "savings", "loans"] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const { role } = await getStaffUser();

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to download templates." }, { status: 403 });
  }

  if (!IMPORT_TYPES.includes(type as ImportType)) {
    return NextResponse.json({ error: "Unknown template type." }, { status: 400 });
  }

  const csv = getImportTemplate(type as ImportType);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gtpea_${type}_template.csv"`,
    },
  });
}
