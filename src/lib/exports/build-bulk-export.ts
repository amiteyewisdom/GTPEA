import { buildReportCsv } from "@/lib/reports/build-report";
import type { AppSupabase } from "@/lib/supabase/types";

export type ExportSheet = "Savings" | "Loans" | "Dividends" | "Withdrawals";

const SHEET_MAP = {
  Savings: "savings",
  Loans: "loans",
  Dividends: "dividends",
  Withdrawals: "withdrawals",
} as const;

export async function buildBulkExport(
  supabase: AppSupabase,
  sheets: ExportSheet[]
): Promise<string> {
  let content = "";

  for (const sheet of sheets) {
    const section = SHEET_MAP[sheet];
    content += `${sheet.toUpperCase()}\n`;

    if (section === "dividends") {
      content += await buildDividendsExport(supabase);
    } else if (section === "withdrawals") {
      content += await buildWithdrawalsExport(supabase);
    } else if (section === "savings") {
      content += await buildReportCsv(supabase, "savings");
    } else if (section === "loans") {
      content += await buildReportCsv(supabase, "loans");
    }

    content += "\n\n";
  }

  return content.trim();
}

async function buildDividendsExport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("dividends")
    .select(`
      fiscal_year,
      average_balance,
      rate_percent,
      dividend_amount,
      credited_at,
      reference,
      employees (employee_no, first_name, last_name)
    `)
    .order("fiscal_year", { ascending: false });

  const headers = [
    "Employee No",
    "Employee Name",
    "Fiscal Year",
    "Average Balance",
    "Rate %",
    "Dividend Amount",
    "Credited At",
    "Reference",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      employee?.employee_no ?? "",
      name,
      row.fiscal_year,
      row.average_balance,
      row.rate_percent,
      row.dividend_amount,
      row.credited_at ?? "",
      row.reference,
    ];
  });

  const { buildCsv } = await import("@/lib/csv");
  return buildCsv(headers, rows);
}

async function buildWithdrawalsExport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("withdrawal_requests")
    .select(`
      request_ref,
      amount,
      reason,
      status,
      requested_at,
      disbursement_date,
      employees (employee_no, first_name, last_name),
      savings (account_number, type)
    `)
    .order("requested_at", { ascending: false });

  const headers = [
    "Reference",
    "Employee No",
    "Employee Name",
    "Account Number",
    "Account Type",
    "Amount",
    "Reason",
    "Status",
    "Requested At",
    "Disbursement Date",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      row.request_ref,
      employee?.employee_no ?? "",
      name,
      row.savings?.account_number ?? "",
      row.savings?.type ?? "",
      row.amount,
      row.reason ?? "",
      row.status,
      row.requested_at,
      row.disbursement_date ?? "",
    ];
  });

  const { buildCsv } = await import("@/lib/csv");
  return buildCsv(headers, rows);
}
