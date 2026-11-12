import { NextResponse } from "next/server";
import { canManagePayroll, getStaffUser } from "@/lib/api/staff-auth";
import {
  exportPayrollMasterFile,
  parsePayrollMasterFile,
  processPayrollMasterFile,
} from "@/lib/payroll/process-master-file";
import {
  buildPayrollDeductionTemplateXlsx,
  parsePayrollDeductionWorkbook,
  processPayrollDeductionFile,
} from "@/lib/payroll/process-deduction-file";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManagePayroll(role)) {
    return NextResponse.json({ error: "Only Admin and Fund Manager can upload payroll files." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));

    if (!file) {
      return NextResponse.json({ error: "Choose a payroll file to upload." }, { status: 400 });
    }

    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Provide a valid year and month." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || file.type.includes("spreadsheet");

    if (isExcel) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const rows = parsePayrollDeductionWorkbook(buffer);
      const result = await processPayrollDeductionFile(rows, { year, month }, user.id);

      return NextResponse.json({
        message: "Payroll deduction file processed.",
        processed: result.processed,
        skipped: result.skipped,
        riceAccountsCreated: result.riceAccountsCreated,
        interestRecorded: result.interestRecorded,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    }

    const text = await file.text();
    const rows = parsePayrollMasterFile(text);
    const result = await processPayrollMasterFile(rows, { year, month }, user.id);

    return NextResponse.json({
      message: "Payroll master file processed.",
      processed: result.processed,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManagePayroll(role)) {
    return NextResponse.json({ error: "Only Admin and Fund Manager can export payroll files." }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("template") === "xlsx") {
      const buffer = await buildPayrollDeductionTemplateXlsx();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="gtpea_payroll_deductions_template.xlsx"`,
        },
      });
    }

    const csv = await exportPayrollMasterFile();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="gtpea_payroll_master_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed." },
      { status: 500 }
    );
  }
}
