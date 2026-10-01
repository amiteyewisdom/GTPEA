import { buildCsv } from "@/lib/csv";
import type { AppSupabase } from "@/lib/supabase/types";
import {
  GL,
  LOAN_ACCOUNT_NAMES,
  SAVINGS_ACCOUNT_NAMES,
  ACTIVE_LOAN_STATUSES,
  isActiveLoanStatus,
  loanProductCode,
  savingsAccountCode,
} from "@/lib/reports/gl-accounts";

/** Throw on a failed query instead of silently reporting empty data. */
function must<T>(res: { data: T[] | null; error: { message: string } | null }, label: string): T[] {
  if (res.error) throw new Error(`${label} query failed: ${res.error.message}`);
  return res.data ?? [];
}

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
  const data = must(
    await supabase
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
      .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
      .order("opened_at", { ascending: false }),
    "Savings"
  );

  const headers = [
    "Employee No",
    "Employee Name",
    "Department",
    "Account Number",
    "GL Code",
    "Account Type",
    "Status",
    "Balance",
    "Monthly Contribution",
    "Opened At",
  ];

  const rows = data.map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    return [
      employee?.employee_no ?? "",
      name,
      employee?.department ?? "",
      row.account_number,
      savingsAccountCode(row),
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
  const { data, error } = await supabase
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
    .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Loans report query failed: ${error.message}`);

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
  const { data, error } = await supabase
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
    .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("due_date", { ascending: true });

  if (error) throw new Error(`Repayments report query failed: ${error.message}`);

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
  const { data, error } = await supabase
    .from("employees")
    .select("employee_no, first_name, last_name, email, phone, department, position, status, date_joined, salary")
    .not("employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("employee_no", { ascending: true });

  if (error) throw new Error(`Employees report query failed: ${error.message}`);

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
  const { data, error } = await supabase
    .from("loans")
    .select(`
      loan_ref,
      outstanding_balance,
      amount_requested,
      amount_approved,
      amount_disbursed,
      interest_rate,
      term_months,
      status,
      disbursement_date,
      employees (employee_no, first_name, last_name, department)
    `)
    .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("outstanding_balance", { ascending: false });

  if (error) throw new Error(`Defaults report query failed: ${error.message}`);

  // Filter in JS — the deployed loan_status enum may not include
  // 'disbursed'/'repaying', which would make a DB-level .in() error out.
  const atRisk = (data ?? []).filter((l: any) =>
    ["defaulted", "active", "approved", "disbursed", "repaying"].includes(l.status)
  );

  const headers = [
    "Loan Reference",
    "Employee No",
    "Employee Name",
    "Department",
    "Status",
    "Principal",
    "Outstanding",
    "Interest Rate",
    "Term Months",
    "Disbursement Date",
    "Recovery %",
  ];

  const rows = atRisk.map((row: any) => {
    const employee = row.employees;
    const name = employee ? `${employee.first_name} ${employee.last_name}` : "";
    // Imported loans have no amount_disbursed; fall back to the approved/requested
    // principal so the recovery ratio is still meaningful.
    const principal =
      Number(row.amount_disbursed) || Number(row.amount_approved) || Number(row.amount_requested) || 0;
    const outstanding = Number(row.outstanding_balance ?? 0);
    const recovered = principal > 0 ? (((principal - outstanding) / principal) * 100).toFixed(1) : "0";

    return [
      row.loan_ref,
      employee?.employee_no ?? "",
      name,
      employee?.department ?? "",
      row.status,
      principal,
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
  const { data, error } = await supabase
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

  if (error) throw new Error(`Approvals report query failed: ${error.message}`);

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
  const year = now.getFullYear();
  const yearStart = new Date(year, 0, 1).toISOString();

  // Income = interest earned + fees/penalties. Member savings contributions and
  // loan principal repayments are NOT income (deposits / balance recovery).
  // Expenditure = recorded fund expenses only; withdrawals pay back members'
  // own money and dividends are an appropriation of surplus, not an expense.
  const [transactionsRes, repaymentsRes, expensesRes, dividendsRes, savingsRes] = await Promise.all([
    // No enum filter — the deployed transaction_type enum differs from schema.sql;
    // filter the income types in JS so this works either way.
    supabase
      .from("transactions")
      .select("type, amount, created_at")
      .gte("created_at", yearStart),
    supabase
      .from("repayments")
      .select("interest_component, paid_date, status")
      .eq("status", "paid")
      .gte("paid_date", yearStart),
    supabase.from("expenses").select("title, category, amount, expense_date").gte("expense_date", yearStart.slice(0, 10)),
    supabase.from("dividends").select("dividend_amount, fiscal_year").eq("fiscal_year", year),
    supabase.from("savings").select("balance").eq("status", "active"),
  ]);

  for (const [res, label] of [
    [transactionsRes, "Transactions"],
    [repaymentsRes, "Repayments"],
    [expensesRes, "Expenses"],
    [dividendsRes, "Dividends"],
    [savingsRes, "Savings"],
  ] as const) {
    if (res.error) throw new Error(`${label} query failed: ${res.error.message}`);
  }

  const transactions = (transactionsRes.data ?? []) as any[];
  const interestFromRepayments = (repaymentsRes.data ?? []).reduce(
    (s: number, r: any) => s + (Number(r.interest_component) || 0),
    0
  );
  // Live enum uses 'interest'; schema.sql uses 'interest_credit' — accept both.
  const interestFromTransactions = transactions
    .filter((t) => t.type === "interest_credit" || t.type === "interest")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const interestIncome = interestFromRepayments + interestFromTransactions;
  const feesAndPenalties = transactions
    .filter((t) => t.type === "fee" || t.type === "penalty")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);

  const expenses = (expensesRes.data ?? []) as any[];
  const expenseByCategory = new Map<string, number>();
  for (const e of expenses) {
    const key = e.category || "General";
    expenseByCategory.set(key, (expenseByCategory.get(key) ?? 0) + (Number(e.amount) || 0));
  }
  const totalExpenses = expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);

  const totalDividends = (dividendsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.dividend_amount), 0);
  const totalSavingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);

  const grossIncome = interestIncome + feesAndPenalties;
  const netSurplus = grossIncome - totalExpenses;
  const retainedAfterDividends = netSurplus - totalDividends;
  const possibleDividend = totalSavingsBalance > 0 ? netSurplus / totalSavingsBalance : 0;

  const reportDate = now.toLocaleDateString("en-GB");
  const headers = ["Account", "Code", "Amount (GH₵)"];
  const rows: (string | number)[][] = [
    [`INCOME (${year})`, "", ""],
    ["Interest Income on Loans", GL.interestIncome, interestIncome.toFixed(2)],
    ["Fees & Penalties", GL.feesAndPenalties, feesAndPenalties.toFixed(2)],
    ["TOTAL INCOME", "", grossIncome.toFixed(2)],
    ["", "", ""],
    [`EXPENDITURE (${year})`, "", ""],
    ...[...expenseByCategory.entries()].map(
      ([category, amount]) => [`Fund Expenses — ${category}`, GL.fundExpenses, amount.toFixed(2)] as (string | number)[]
    ),
    ["TOTAL EXPENDITURE", "", totalExpenses.toFixed(2)],
    ["", "", ""],
    ["NET SURPLUS / (DEFICIT)", "", netSurplus.toFixed(2)],
    ["", "", ""],
    ["APPROPRIATION", "", ""],
    ["Dividends to Members", GL.dividends, totalDividends.toFixed(2)],
    ["RETAINED SURPLUS / (DEFICIT)", "", retainedAfterDividends.toFixed(2)],
    ["", "", ""],
    ["POSSIBLE DIVIDEND (Net Surplus / Total Savings)", "", (possibleDividend * 100).toFixed(2) + "%"],
    ["", "", ""],
    [`Report Date: ${reportDate}`, `Period: ${year}`, ""],
  ];

  return buildCsv(headers, rows);
}

async function buildBalanceSheetReport(supabase: AppSupabase) {
  const [savingsRes, loansRes, dividendsRes, repaymentsRes, transactionsRes, expensesRes] = await Promise.all([
    supabase.from("savings").select("balance, account_number, status").eq("status", "active"),
    supabase
      .from("loans")
      .select("outstanding_balance, status, loan_products(name, account_code)"),
    supabase.from("dividends").select("dividend_amount, credited_at"),
    supabase.from("repayments").select("interest_component").eq("status", "paid"),
    supabase.from("transactions").select("type, amount"),
    supabase.from("expenses").select("amount"),
  ]);

  for (const [res, label] of [
    [savingsRes, "Savings"],
    [loansRes, "Loans"],
    [dividendsRes, "Dividends"],
    [repaymentsRes, "Repayments"],
    [transactionsRes, "Transactions"],
    [expensesRes, "Expenses"],
  ] as const) {
    if (res.error) throw new Error(`${label} query failed: ${res.error.message}`);
  }

  // Loans receivable grouped by product GL code (status filtered in JS —
  // the deployed enum may not include disbursed/repaying)
  const loansByCode = new Map<string, number>();
  for (const l of (loansRes.data ?? []) as any[]) {
    if (!isActiveLoanStatus(l.status)) continue;
    const code = loanProductCode(l.loan_products);
    loansByCode.set(code, (loansByCode.get(code) ?? 0) + (Number(l.outstanding_balance) || 0));
  }
  const totalLoanPortfolio = [...loansByCode.values()].reduce((s, v) => s + v, 0);

  // Members' funds grouped by savings GL code
  const savingsByCode = new Map<string, number>();
  for (const s of (savingsRes.data ?? []) as any[]) {
    const code = savingsAccountCode(s);
    savingsByCode.set(code, (savingsByCode.get(code) ?? 0) + (Number(s.balance) || 0));
  }
  const totalSavings = [...savingsByCode.values()].reduce((s, v) => s + v, 0);

  // Dividends declared but not yet credited are payable; credited ones are appropriated
  const dividends = (dividendsRes.data ?? []) as any[];
  const dividendsPayable = dividends
    .filter((d) => !d.credited_at)
    .reduce((s, d) => s + (Number(d.dividend_amount) || 0), 0);
  const dividendsCredited = dividends
    .filter((d) => d.credited_at)
    .reduce((s, d) => s + (Number(d.dividend_amount) || 0), 0);

  // Retained surplus = cumulative income − expenses − dividends credited
  const interestFromRepayments = (repaymentsRes.data ?? []).reduce(
    (s: number, r: any) => s + (Number(r.interest_component) || 0),
    0
  );
  const interestFromTransactions = (transactionsRes.data ?? [])
    .filter((t: any) => t.type === "interest_credit" || t.type === "interest")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const feesAndPenalties = (transactionsRes.data ?? [])
    .filter((t: any) => t.type === "fee" || t.type === "penalty")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpenses = (expensesRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
  const retainedSurplus =
    interestFromRepayments + interestFromTransactions + feesAndPenalties - totalExpenses - dividendsCredited;

  // Cash/bank is not tracked in the system — it is the balancing figure:
  // members' funds + retained surplus − loans receivable.
  const totalLiabilities = totalSavings + dividendsPayable;
  const cashAndBank = totalLiabilities + retainedSurplus - totalLoanPortfolio;
  const totalAssets = totalLoanPortfolio + cashAndBank;

  const reportDate = new Date().toLocaleDateString("en-GB");
  const headers = ["Item", "Code", "Amount (GH₵)"];
  const rows: (string | number)[][] = [
    ["ASSETS", "", ""],
    ...[...loansByCode.entries()].map(
      ([code, amount]) =>
        [`${LOAN_ACCOUNT_NAMES[code] ?? "Loans"} — Outstanding`, code, amount.toFixed(2)] as (string | number)[]
    ),
    ["Cash & Bank Balances (balancing figure — not tracked in system)", GL.cashAndBank, cashAndBank.toFixed(2)],
    ["TOTAL ASSETS", "", totalAssets.toFixed(2)],
    ["", "", ""],
    ["MEMBERS' FUNDS & LIABILITIES", "", ""],
    ...[...savingsByCode.entries()].map(
      ([code, amount]) => [SAVINGS_ACCOUNT_NAMES[code] ?? "Member Deposits", code, amount.toFixed(2)] as (string | number)[]
    ),
    ["Dividends Payable", GL.dividends, dividendsPayable.toFixed(2)],
    ["TOTAL MEMBERS' FUNDS & LIABILITIES", "", totalLiabilities.toFixed(2)],
    ["", "", ""],
    ["SURPLUS / (DEFICIT)", "", ""],
    ["Retained Surplus", "", retainedSurplus.toFixed(2)],
    ["TOTAL FUNDS, LIABILITIES & SURPLUS", "", (totalLiabilities + retainedSurplus).toFixed(2)],
    ["", "", ""],
    [`Report Date: ${reportDate}`, "", ""],
  ];

  return buildCsv(headers, rows);
}

async function buildTrialBalanceReport(supabase: AppSupabase) {
  const [savingsRes, loansRes, repaymentRes, dividendRes, transactionRes, expensesRes] = await Promise.all([
    supabase.from("savings").select("balance, account_number").eq("status", "active"),
    supabase
      .from("loans")
      .select("outstanding_balance, status, loan_products(name, account_code)"),
    supabase.from("repayments").select("interest_component").eq("status", "paid"),
    supabase.from("dividends").select("dividend_amount").not("credited_at", "is", null),
    supabase.from("transactions").select("type, amount"),
    supabase.from("expenses").select("amount"),
  ]);

  for (const [res, label] of [
    [savingsRes, "Savings"],
    [loansRes, "Loans"],
    [repaymentRes, "Repayments"],
    [dividendRes, "Dividends"],
    [transactionRes, "Transactions"],
    [expensesRes, "Expenses"],
  ] as const) {
    if (res.error) throw new Error(`${label} query failed: ${res.error.message}`);
  }

  // One line per GL account. Balances are already net of activity (payroll
  // contributions raise savings.balance, withdrawals and loan recoveries
  // lower it), so flow totals are not repeated here — that double-counted.
  const savingsByCode = new Map<string, number>();
  for (const s of (savingsRes.data ?? []) as any[]) {
    const code = savingsAccountCode(s);
    savingsByCode.set(code, (savingsByCode.get(code) ?? 0) + (Number(s.balance) || 0));
  }

  const loansByCode = new Map<string, number>();
  for (const l of (loansRes.data ?? []) as any[]) {
    if (!isActiveLoanStatus(l.status)) continue;
    const code = loanProductCode(l.loan_products);
    loansByCode.set(code, (loansByCode.get(code) ?? 0) + (Number(l.outstanding_balance) || 0));
  }

  const interestReceived =
    (repaymentRes.data ?? []).reduce((s: number, r: any) => s + (Number(r.interest_component) || 0), 0) +
    (transactionRes.data ?? [])
      .filter((t: any) => t.type === "interest_credit" || t.type === "interest")
      .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const dividendsPaid = (dividendRes.data ?? []).reduce((s: number, r: any) => s + Number(r.dividend_amount), 0);
  const feesAndPenalties = (transactionRes.data ?? [])
    .filter((t: any) => ["fee", "penalty"].includes(t.type))
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpenses = (expensesRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);

  const debitRows: (string | number)[][] = [...loansByCode.entries()].map(
    ([code, amount]) => [`${LOAN_ACCOUNT_NAMES[code] ?? "Loans"} — Outstanding`, code, amount.toFixed(2), ""]
  );
  debitRows.push(["Dividends Paid", GL.dividends, dividendsPaid.toFixed(2), ""]);
  debitRows.push(["Fund Expenses", GL.fundExpenses, totalExpenses.toFixed(2), ""]);

  const creditRows: (string | number)[][] = [...savingsByCode.entries()].map(
    ([code, amount]) => [SAVINGS_ACCOUNT_NAMES[code] ?? "Member Deposits", code, "", amount.toFixed(2)]
  );
  creditRows.push(["Interest Income on Loans", GL.interestIncome, "", interestReceived.toFixed(2)]);
  creditRows.push(["Fees & Penalties", GL.feesAndPenalties, "", feesAndPenalties.toFixed(2)]);

  const totalDebits =
    [...loansByCode.values()].reduce((s, v) => s + v, 0) + dividendsPaid + totalExpenses;
  const totalCredits =
    [...savingsByCode.values()].reduce((s, v) => s + v, 0) + interestReceived + feesAndPenalties;

  const reportDate = new Date().toLocaleDateString("en-GB");
  const headers = ["Account Name", "Code", "Debit (GH₵)", "Credit (GH₵)"];
  const rows: (string | number)[][] = [
    ["DEBITS", "", "", ""],
    ...debitRows,
    ["", "", "", ""],
    ["CREDITS", "", "", ""],
    ...creditRows,
    ["", "", "", ""],
    ["TOTALS", "", totalDebits.toFixed(2), totalCredits.toFixed(2)],
    ["NET BALANCE — implied fund cash position (Credits - Debits)", "", "", (totalCredits - totalDebits).toFixed(2)],
    ["", "", "", ""],
    ["Note: balances are net of recorded contributions, withdrawals and payroll recoveries.", "", "", ""],
    [`Report Date: ${reportDate}`, "", "", ""],
  ];

  return buildCsv(headers, rows);
}

async function buildBankPaymentReport(supabase: AppSupabase) {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      loan_ref,
      amount_disbursed,
      disbursement_date,
      status,
      employees (employee_no, first_name, last_name, bank_name, bank_account_no)
    `)
    .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("disbursement_date", { ascending: false });

  if (error) throw new Error(`Bank payment report query failed: ${error.message}`);

  // Filter in JS — the deployed loan_status enum may not include
  // 'disbursed'/'repaying', which would make a DB-level .in() error out.
  const disbursedLoans = (data ?? []).filter((l: any) => isActiveLoanStatus(l.status));

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

  const rows = disbursedLoans.map((row: any) => {
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

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, employee_no, first_name, last_name, department, salary")
    .not("employee_no", "in", "(ADMIN001,ADMIN002)")
    .eq("status", "active")
    .order("employee_no", { ascending: true });

  if (employeesError) throw new Error(`Employees query failed: ${employeesError.message}`);

  const empIds = (employees ?? []).map((e: any) => e.id);

  // Loan deductions are ongoing — list every loan carrying a balance, not just
  // loans created inside the selected month.
  const [savingsRes, loansRes] = await Promise.all([
    empIds.length > 0
      ? supabase
          .from("savings_contributions")
          .select("employee_id, amount")
          .eq("period_year", year)
          .eq("period_month", month)
          .in("employee_id", empIds)
      : Promise.resolve({ data: [], error: null }),
    empIds.length > 0
      ? supabase
          .from("loans")
          .select("employee_id, monthly_repayment, outstanding_balance, status")
          .in("employee_id", empIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (savingsRes.error) throw new Error(`Savings contributions query failed: ${savingsRes.error.message}`);
  if (loansRes.error) throw new Error(`Loans query failed: ${loansRes.error.message}`);

  const savingsByEmp: Record<string, { monthly: number }> = {};
  for (const s of (savingsRes.data ?? []) as any[]) {
    if (!savingsByEmp[s.employee_id]) savingsByEmp[s.employee_id] = { monthly: 0 };
    savingsByEmp[s.employee_id].monthly += Number(s.amount);
  }

  const loansByEmp: Record<string, { monthly: number; outstanding: number }> = {};
  for (const l of (loansRes.data ?? []) as any[]) {
    if (!isActiveLoanStatus(l.status)) continue;
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
