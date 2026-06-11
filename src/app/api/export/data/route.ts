import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { buildBulkExport, type ExportSheet } from "@/lib/exports/build-bulk-export";

const VALID_SHEETS: ExportSheet[] = ["Savings", "Loans", "Dividends", "Withdrawals"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetsParam = searchParams.get("sheets") ?? "Savings,Loans,Dividends,Withdrawals";

  const sheets = sheetsParam
    .split(",")
    .map((sheet) => sheet.trim())
    .filter((sheet): sheet is ExportSheet => VALID_SHEETS.includes(sheet as ExportSheet));

  if (sheets.length === 0) {
    return NextResponse.json({ error: "Choose at least one export section." }, { status: 400 });
  }

  const { supabase, role } = await getStaffUser();

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to export data." }, { status: 403 });
  }

  try {
    const content = await buildBulkExport(supabase, sheets);
    const date = new Date().toISOString().split("T")[0];
    const filename = `gtpea_export_${date}.csv`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed." },
      { status: 500 }
    );
  }
}
