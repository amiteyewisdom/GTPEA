import { buildCsv } from "@/lib/csv";
import type { AppSupabase } from "@/lib/supabase/types";

export const REPORT_TYPES = [
  "savings",
  "loans",
  "repayments",
  "employees",
  "defaults",
  "approvals",
  "profit_loss",
  "balance_sheet",
  "trial_balance",
  "bank_payment",
  "payroll",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_LABELS: Record<ReportType, string> = {
  savings: "Savings Summary Report",
  loans: "Loan Disbursement Report",
  repayments: "Repayment Schedule Report",
  employees: "Employee Status Report",
  defaults: "Default and Risk Report",
  approvals: "Approval Audit Report",
  profit_loss: "Profit & Loss Statement",
  balance_sheet: "Balance Sheet",
  trial_balance: "Trial Balance",
  bank_payment: "Bank Payment Export",
  payroll: "Payroll Export (Savings & Loans)",
};

export interface ReportOptions {
  year?: number;
  month?: number;
  sortBy?: string;
}

export async function buildReportCsv(supabase: AppSupabase, type: ReportType, options?: ReportOptions): Promise<string> {
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
    case "profit_loss":
      return buildProfitLossReport(supabase);
    case "balance_sheet":
      return buildBalanceSheetReport(supabase);
    case "trial_balance":
      return buildTrialBalanceReport(supabase);
    case "bank_payment":
      return buildBankPaymentReport(supabase);
    case "payroll":
      return buildPayrollReport(supabase, options);
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

async function buildProfitLossReport(supabase: AppSupabase) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const [interestRes, savingsContribRes, dividendsRes, withdrawalsRes] = await Promise.all([
    supabase.from("transactions").select("type, amount, created_at").in("type", ["interest_credit", "loan_repayment"]).gte("created_at", yearStart),
    supabase.from("savings_contributions").select("amount, period_year, period_month").eq("period_year", now.getFullYear()),
    supabase.from("dividends").select("dividend_amount, fiscal_year").eq("fiscal_year", now.getFullYear()),
    supabase.from("withdrawal_requests").select("amount, status").in("status", ["approved", "disbursed"]).gte("created_at", yearStart),
  ]);

  const interestIncome = (interestRes.data ?? [])
    .filter((t: any) => t.type === "interest_credit")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);

  const loanRepayments = (interestRes.data ?? [])
    .filter((t: any) => t.type === "loan_repayment")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);

  const totalSavingsContributions = (savingsContribRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
  const totalDividendsPaid = (dividendsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.dividend_amount), 0);
  const totalWithdrawals = (withdrawalsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);

  const grossIncome = interestIncome + loanRepayments;
  const totalExpenses = totalDividendsPaid + totalWithdrawals;
  const netSurplus = grossIncome - totalExpenses;

  const reportDate = now.toLocaleDateString("en-GB");
  const headers = ["Account", "Code", "Amount (GH₵)"];
  const rows: (string | number)[][] = [
    ["INCOME", "", ""],
    ["Interest Income on Loans", "11101001", interestIncome.toFixed(2)],
    ["Loan Repayments Received", "62101001", loanRepayments.toFixed(2)],
    ["Total Savings Contributions", "63101001", totalSavingsContributions.toFixed(2)],
    ["TOTAL INCOME", "", grossIncome.toFixed(2)],
    ["", "", ""],
    ["EXPENDITURE", "", ""],
    ["Dividends Paid to Members", "63101003", totalDividendsPaid.toFixed(2)],
    ["Savings Withdrawals Disbursed", "63101001", totalWithdrawals.toFixed(2)],
    ["TOTAL EXPENDITURE", "", totalExpenses.toFixed(2)],
    ["", "", ""],
    ["NET SURPLUS / (DEFICIT)", "", netSurplus.toFixed(2)],
    ["", "", ""],
    [`Report Date: ${reportDate}`, `Period: ${now.getFullYear()}`, ""],
  ];

  return buildCsv(headers, rows);
}

async function buildBalanceSheetReport(supabase: AppSupabase) {
  const [savingsRes, loansRes, withdrawalsRes, dividendsRes] = await Promise.all([
    supabase.from("savings").select("balance, status").eq("status", "active"),
    supabase.from("loans").select("outstanding_balance, amount_disbursed, status").in("status", ["disbursed", "repaying", "approved"]),
    supabase.from("withdrawal_requests").select("amount, status").in("status", ["approved", "disbursed"]),
    supabase.from("dividends").select("dividend_amount").not("credited_at", "is", null),
  ]);

  const totalSavings = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance), 0);
  const totalLoanPortfolio = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.outstanding_balance), 0);
  const totalDisbursed = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount_disbursed || 0), 0);
  const totalWithdrawalsLiability = (withdrawalsRes.data ?? []).filter((r: any) => r.status === "approved").reduce((s: number, r: any) => s + Number(r.amount), 0);
  const totalDividendsLiability = (dividendsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.dividend_amount), 0);

  const totalAssets = totalLoanPortfolio + totalSavings;
  const totalLiabilities = totalWithdrawalsLiability + totalDividendsLiability;
  const membersEquity = totalAssets - totalLiabilities;

  const reportDate = new Date().toLocaleDateString("en-GB");
  const headers = ["Item", "Code", "Amount (GH₵)"];
  const rows: (string | number)[][] = [
    ["ASSETS", "", ""],
    ["Loan Portfolio (Outstanding)", "62101001", totalLoanPortfolio.toFixed(2)],
    ["Total Loan Disbursed", "62101001", totalDisbursed.toFixed(2)],
    ["Members Savings Balance", "63101001", totalSavings.toFixed(2)],
    ["TOTAL ASSETS", "", totalAssets.toFixed(2)],
    ["", "", ""],
    ["LIABILITIES", "", ""],
    ["Approved Pending Withdrawals", "63101001", totalWithdrawalsLiability.toFixed(2)],
    ["Dividends Payable", "63101003", totalDividendsLiability.toFixed(2)],
    ["TOTAL LIABILITIES", "", totalLiabilities.toFixed(2)],
    ["", "", ""],
    ["MEMBERS EQUITY", "", membersEquity.toFixed(2)],
    ["", "", ""],
    [`Report Date: ${reportDate}`, "", ""],
  ];

  return buildCsv(headers, rows);
}

async function buildTrialBalanceReport(supabase: AppSupabase) {
  const [savingsRes, loansRes, repaymentRes, withdrawalRes, dividendRes, transactionRes, contributionsRes, expensesRes] = await Promise.all([
    supabase.from("savings").select("balance").eq("status", "active"),
    supabase.from("loans").select("outstanding_balance, amount_approved, amount_requested, amount_disbursed, status").in("status", ["disbursed", "repaying", "approved"]),
    supabase.from("repayments").select("amount_paid, interest_component").eq("status", "paid"),
    supabase.from("withdrawal_requests").select("amount").in("status", ["approved", "disbursed"]),
    supabase.from("dividends").select("dividend_amount").not("credited_at", "is", null),
    supabase.from("transactions").select("type, amount").in("type", ["interest_credit", "fee", "penalty"]),
    supabase.from("savings_contributions").select("amount"),
    supabase.from("expenses").select("amount"),
  ]);

  const membersSavings = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance), 0);
  const totalContributions = (contributionsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);

  // Use fallbacks for loans that haven't been formally disbursed yet
  const loansOutstanding = (loansRes.data ?? []).reduce((s: number, r: any) => {
    return s + (Number(r.outstanding_balance) || Number(r.amount_approved) || Number(r.amount_requested) || 0);
  }, 0);
  const loansDisbursed = (loansRes.data ?? []).reduce((s: number, r: any) => {
    return s + (Number(r.amount_disbursed) || Number(r.amount_approved) || Number(r.amount_requested) || 0);
  }, 0);

  const repaymentReceived = (repaymentRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount_paid), 0);
  const interestReceived = (repaymentRes.data ?? []).reduce((s: number, r: any) => s + Number(r.interest_component), 0);
  const withdrawalsDisbursed = (withdrawalRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
  const dividendsPaid = (dividendRes.data ?? []).reduce((s: number, r: any) => s + Number(r.dividend_amount), 0);
  const feesAndPenalties = (transactionRes.data ?? []).filter((t: any) => ["fee", "penalty"].includes(t.type)).reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpenses = (expensesRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);

  const totalDebits = loansDisbursed + withdrawalsDisbursed + dividendsPaid + totalExpenses;
  const totalCredits = membersSavings + totalContributions + repaymentReceived + interestReceived + feesAndPenalties;

  const reportDate = new Date().toLocaleDateString("en-GB");
  const headers = ["Account Name", "Code", "Debit (GH₵)", "Credit (GH₵)"];
  const rows: (string | number)[][] = [
    ["Members Savings (Balances)", "63101001", "", membersSavings.toFixed(2)],
    ["Total Savings Contributions", "63101001", "", totalContributions.toFixed(2)],
    ["Loans Disbursed (Total)", "62101001", loansDisbursed.toFixed(2), ""],
    ["Loans Outstanding", "62101001", loansOutstanding.toFixed(2), ""],
    ["Repayments Received", "62101001", "", repaymentReceived.toFixed(2)],
    ["Interest on Loans", "11101001", "", interestReceived.toFixed(2)],
    ["Withdrawals Disbursed", "63101001", withdrawalsDisbursed.toFixed(2), ""],
    ["Dividends Paid", "63101003", dividendsPaid.toFixed(2), ""],
    ["Fees & Penalties", "11101001", "", feesAndPenalties.toFixed(2)],
    ["Fund Expenses", "63101001", totalExpenses.toFixed(2), ""],
    ["", "", "", ""],
    ["TOTALS", "", totalDebits.toFixed(2), totalCredits.toFixed(2)],
    ["NET BALANCE (Credits - Debits)", "", "", (totalCredits - totalDebits).toFixed(2)],
    ["", "", "", ""],
    [`Report Date: ${reportDate}`, "", "", ""],
  ];

  return buildCsv(headers, rows);
}

async function buildBankPaymentReport(supabase: AppSupabase) {
  const { data } = await supabase
    .from("loans")
    .select(`
      loan_ref,
      amount_disbursed,
      disbursement_date,
      status,
      employees (employee_no, first_name, last_name, bank_name, bank_account_no)
    `)
    .in("status", ["disbursed", "repaying"])
    .order("disbursement_date", { ascending: false });

  const headers = [
    "Employee No",
    "Employee Name",
    "Bank Name",
    "Account Number",
    "Loan Reference",
    "Amount (GH₵)",
    "Disbursement Date",
    "Payment Type",
  ];

  const rows = (data ?? []).map((row: any) => {
    const emp = row.employees;
    return [
      emp?.employee_no ?? "",
      emp ? `${emp.first_name} ${emp.last_name}` : "",
      emp?.bank_name ?? "",
      emp?.bank_account_no ?? "",
      row.loan_ref,
      row.amount_disbursed ?? 0,
      row.disbursement_date ?? "",
      "LOAN DISBURSEMENT",
    ];
  });

  return buildCsv(headers, rows);
}

async function buildPayrollReport(supabase: AppSupabase, options?: ReportOptions) {
  const now = new Date();
  const year = options?.year ?? now.getFullYear();
  const month = options?.month ?? now.getMonth() + 1;
  const sortBy = options?.sortBy ?? "name";
  const startOfMonth = new Date(year, month - 1, 1).toISOString();
  const endOfMonth = new Date(year, month, 1).toISOString();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, employee_no, first_name, last_name, department, salary")
    .eq("status", "active")
    .order("employee_no", { ascending: true });

  const empIds = (employees ?? []).map((e: any) => e.id);

  const [savingsRes, loansRes] = await Promise.all([
    empIds.length > 0
      ? supabase
          .from("savings_contributions")
          .select("employee_id, amount")
          .eq("period_year", year)
          .eq("period_month", month)
          .in("employee_id", empIds)
      : Promise.resolve({ data: [] }),
    empIds.length > 0
      ? supabase
          .from("loans")
          .select("employee_id, monthly_repayment, outstanding_balance")
          .gte("created_at", startOfMonth)
          .lt("created_at", endOfMonth)
          .in("employee_id", empIds)
      : Promise.resolve({ data: [] }),
  ]);

  const savingsByEmp: Record<string, { monthly: number }> = {};
  for (const s of (savingsRes.data ?? []) as any[]) {
    if (!savingsByEmp[s.employee_id]) savingsByEmp[s.employee_id] = { monthly: 0 };
    savingsByEmp[s.employee_id].monthly += Number(s.amount);
  }

  const loansByEmp: Record<string, { monthly: number; outstanding: number }> = {};
  for (const l of (loansRes.data ?? []) as any[]) {
    if (!loansByEmp[l.employee_id]) loansByEmp[l.employee_id] = { monthly: 0, outstanding: 0 };
    loansByEmp[l.employee_id].monthly += Number(l.monthly_repayment);
    loansByEmp[l.employee_id].outstanding += Number(l.outstanding_balance);
  }

  const headers = [
    "Employee No",
    "Employee Name",
    "Department",
    "Gross Salary (GH₵)",
    "Monthly Savings Deduction (GH₵)",
    "Monthly Loan Deduction (GH₵)",
    "Loan Outstanding (GH₵)",
    "Total Deductions (GH₵)",
    "Net Pay (GH₵)",
  ];

  const rows = (employees ?? [])
    .map((emp: any) => {
      const sav = savingsByEmp[emp.id] || { monthly: 0 };
      const loan = loansByEmp[emp.id] || { monthly: 0, outstanding: 0 };
      if (sav.monthly === 0 && loan.monthly === 0) return null;
      const totalDeductions = sav.monthly + loan.monthly;
      const netPay = Number(emp.salary) - totalDeductions;
      return {
        employeeNo: emp.employee_no,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department,
        salary: Number(emp.salary),
        savingsDeduction: sav.monthly,
        loanDeduction: loan.monthly,
        loanOutstanding: loan.outstanding,
        totalDeductions,
        netPay,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "employee_no":
          return a.employeeNo.localeCompare(b.employeeNo);
        case "department":
          return a.department.localeCompare(b.department);
        case "total_deductions":
          return b.totalDeductions - a.totalDeductions;
        case "net_pay":
          return b.netPay - a.netPay;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    })
    .map((row: any) => [
      row.employeeNo,
      row.name,
      row.department,
      row.salary.toFixed(2),
      row.savingsDeduction.toFixed(2),
      row.loanDeduction.toFixed(2),
      row.loanOutstanding.toFixed(2),
      row.totalDeductions.toFixed(2),
      row.netPay.toFixed(2),
    ]);

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
