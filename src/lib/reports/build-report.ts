import { buildCsv } from "@/lib/csv";
import type { AppSupabase } from "@/lib/supabase/types";

export const REPORT_TYPES = [
  "savings",
  "loans",
  "repayments",
  "employees",
  "defaults",
  "approvals",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_LABELS: Record<ReportType, string> = {
  savings: "Savings Summary Report",
  loans: "Loan Disbursement Report",
  repayments: "Repayment Schedule Report",
  employees: "Employee Status Report",
  defaults: "Default and Risk Report",
  approvals: "Approval Audit Report",
};

export async function buildReportCsv(supabase: AppSupabase, type: ReportType): Promise<string> {
  switch (type) {
    case "savings":
      return buildSavingsReport(supabase);
    case "loans":
      return buildLoansReport(supabase);
    case "repayments":
      return buildRepaymentsReport(supabase);
    case "employees":
      return buildEmployeesReport(supabase);
    case "defaults":
      return buildDefaultsReport(supabase);
    case "approvals":
      return buildApprovalsReport(supabase);
    default:
      throw new Error("Unknown report type");
  }
}

async function buildSavingsReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("savings")
    .select(`
      account_number,
      type,
      status,
      balance,
      monthly_contribution,
      opened_at,
      employees (employee_no, first_name, last_name, department)
    `)
    .order("opened_at", { ascending: false });

  const headers = [
    "Employee No",
    "Employee Name",
    "Department",
    "Account Number",
    "Account Type",
    "Status",
    "Balance",
    "Monthly Contribution",
    "Opened At",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      employee?.employee_no ?? "",
      name,
      employee?.department ?? "",
      row.account_number,
      row.type,
      row.status,
      row.balance,
      row.monthly_contribution,
      row.opened_at,
    ];
  });

  return buildCsv(headers, rows);
}

async function buildLoansReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("loans")
    .select(`
      loan_ref,
      amount_requested,
      amount_approved,
      amount_disbursed,
      outstanding_balance,
      interest_rate,
      term_months,
      monthly_repayment,
      status,
      purpose,
      disbursement_date,
      created_at,
      employees (employee_no, first_name, last_name),
      loan_products (name)
    `)
    .order("created_at", { ascending: false });

  const headers = [
    "Reference",
    "Employee No",
    "Employee Name",
    "Product",
    "Amount Requested",
    "Amount Approved",
    "Amount Disbursed",
    "Outstanding",
    "Interest Rate",
    "Term Months",
    "Monthly Repayment",
    "Status",
    "Purpose",
    "Disbursement Date",
    "Created At",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      row.loan_ref,
      employee?.employee_no ?? "",
      name,
      row.loan_products?.name ?? "",
      row.amount_requested,
      row.amount_approved ?? "",
      row.amount_disbursed ?? "",
      row.outstanding_balance,
      row.interest_rate,
      row.term_months,
      row.monthly_repayment,
      row.status,
      row.purpose ?? "",
      row.disbursement_date ?? "",
      row.created_at,
    ];
  });

  return buildCsv(headers, rows);
}

async function buildRepaymentsReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("repayments")
    .select(`
      installment_no,
      amount_due,
      amount_paid,
      due_date,
      paid_date,
      status,
      loans (loan_ref),
      employees (employee_no, first_name, last_name)
    `)
    .order("due_date", { ascending: true });

  const headers = [
    "Loan Reference",
    "Employee No",
    "Employee Name",
    "Installment",
    "Amount Due",
    "Amount Paid",
    "Due Date",
    "Paid Date",
    "Status",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      row.loans?.loan_ref ?? "",
      employee?.employee_no ?? "",
      name,
      row.installment_no,
      row.amount_due,
      row.amount_paid,
      row.due_date,
      row.paid_date ?? "",
      row.status,
    ];
  });

  return buildCsv(headers, rows);
}

async function buildEmployeesReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("employees")
    .select("employee_no, first_name, last_name, email, phone, department, position, status, date_joined, salary")
    .order("employee_no", { ascending: true });

  const headers = [
    "Employee No",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Department",
    "Position",
    "Status",
    "Join Date",
    "Salary",
  ];

  const rows = (data ?? []).map((row: any) => [
    row.employee_no,
    row.first_name,
    row.last_name,
    row.email,
    row.phone ?? "",
    row.department,
    row.position,
    row.status,
    row.date_joined,
    row.salary,
  ]);

  return buildCsv(headers, rows);
}

async function buildDefaultsReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("loans")
    .select(`
      loan_ref,
      outstanding_balance,
      amount_disbursed,
      interest_rate,
      term_months,
      status,
      disbursement_date,
      employees (employee_no, first_name, last_name, department)
    `)
    .in("status", ["defaulted", "repaying", "disbursed"])
    .order("outstanding_balance", { ascending: false });

  const headers = [
    "Loan Reference",
    "Employee No",
    "Employee Name",
    "Department",
    "Status",
    "Disbursed",
    "Outstanding",
    "Interest Rate",
    "Term Months",
    "Disbursement Date",
    "Recovery %",
  ];

  const rows = (data ?? []).map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    const disbursed = Number(row.amount_disbursed ?? 0);
    const outstanding = Number(row.outstanding_balance ?? 0);
    const recovered = disbursed > 0 ? (((disbursed - outstanding) / disbursed) * 100).toFixed(1) : "0";

    return [
      row.loan_ref,
      employee?.employee_no ?? "",
      name,
      employee?.department ?? "",
      row.status,
      row.amount_disbursed ?? 0,
      row.outstanding_balance,
      row.interest_rate,
      row.term_months,
      row.disbursement_date ?? "",
      recovered,
    ];
  });

  return buildCsv(headers, rows);
}

async function buildApprovalsReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("approvals")
    .select(`
      entity_type,
      entity_id,
      status,
      current_stage,
      total_stages,
      submitted_at,
      completed_at,
      approval_actions (
        stage,
        required_role,
        action,
        notes,
        actioned_at,
        actioned_by
      )
    `)
    .order("submitted_at", { ascending: false });

  const headers = [
    "Entity Type",
    "Entity ID",
    "Status",
    "Stage",
    "Submitted At",
    "Completed At",
    "Reviewer",
    "Action",
    "Action Notes",
    "Actioned At",
  ];

  const rows: (string | number)[][] = [];

  for (const approval of data ?? []) {
    const actions = (approval as any).approval_actions ?? [];

    if (actions.length === 0) {
      rows.push([
        approval.entity_type,
        approval.entity_id,
        approval.status,
        `${approval.current_stage}/${approval.total_stages}`,
        approval.submitted_at,
        approval.completed_at ?? "",
        "",
        "",
        "",
        "",
      ]);
      continue;
    }

    for (const action of actions) {
      rows.push([
        approval.entity_type,
        approval.entity_id,
        approval.status,
        `${action.stage}/${approval.total_stages}`,
        approval.submitted_at,
        approval.completed_at ?? "",
        action.required_role,
        action.action,
        action.notes ?? "",
        action.actioned_at,
      ]);
    }
  }

  return buildCsv(headers, rows);
}

export function buildPrintableHtml(title: string, csv: string): string {
  const lines = csv.split("\n");
  const headers = lines[0]?.split(",") ?? [];
  const bodyRows = lines.slice(1).map((line) => line.split(","));

  const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
  const tableBody = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { color: #555; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
