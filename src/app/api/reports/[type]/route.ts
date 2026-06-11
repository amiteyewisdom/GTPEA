import { NextResponse } from "next/server";
import { canExportReports, getStaffUser } from "@/lib/api/staff-auth";
import {
  REPORT_TYPES,
  REPORT_LABELS,
  buildPrintableHtml,
  buildReportCsv,
  type ReportType,
} from "@/lib/reports/build-report";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "csv";

  if (!REPORT_TYPES.includes(type as ReportType)) {
    return NextResponse.json({ error: "Unknown report type." }, { status: 400 });
  }

  const { supabase, role } = await getStaffUser();

  if (!canExportReports(role)) {
    return NextResponse.json({ error: "You do not have permission to export reports." }, { status: 403 });
  }

  try {
    const csv = await buildReportCsv(supabase, type as ReportType);
    const title = REPORT_LABELS[type as ReportType];
    const date = new Date().toISOString().split("T")[0];

    if (format === "pdf" || format === "print") {
      const html = buildPrintableHtml(title, csv);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="gtpea_${type}_report_${date}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate report." },
      { status: 500 }
    );
  }
}
