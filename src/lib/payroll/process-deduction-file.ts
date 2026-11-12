import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSupabase } from "@/lib/supabase/types";

// Monthly payroll deduction workbook ("Payroll Details Cost(Transaction)").
// One row per employee; GTPEA deduction columns map to savings pots and loan
// products. Junior staff sheets omit the loan-interest columns.

export type PayrollDeductionInterest = {
  project: number;
  other: number;
  rent: number;
  personal: number;
  car: number;
};

export type PayrollDeductionRow = {
  staffId: string;
  name: string;
  savings: number;
  schoolFees: number;
  quickCash: number;
  land: number;
  rice: number;
  interest: PayrollDeductionInterest;
};

export type PayrollDeductionResult = {
  processed: number;
  skipped: number;
  riceAccountsCreated: number;
  interestRecorded: number;
  errors: string[];
};

const HEADER_MAP: Record<string, string> = {
  STAFFID: "staffId",
  EMPLOYEENAME: "name",
  GTPEASAVINGS: "savings",
  GTPEASCHOOLFEES: "schoolFees",
  GTPEAQUICKCASH: "quickCash",
  GTPEALAND: "land",
  GTPEARICE: "rice",
  PROJECTLOANINT: "intProject",
  OTHERLOANINT: "intOther",
  RENTLOANINT: "intRent",
  PERSONALLOANINT: "intPersonal",
  GTPEACARLOANINT: "intCar",
};

const INTEREST_LABELS: { key: keyof PayrollDeductionInterest; label: string; tag: string }[] = [
  { key: "project", label: "Project loan", tag: "PROJECT" },
  { key: "other", label: "Other loan", tag: "OTHER" },
  { key: "rent", label: "Rent loan", tag: "RENT" },
  { key: "personal", label: "Personal loan", tag: "PERSONAL" },
  { key: "car", label: "GTPEA Car loan", tag: "CAR" },
];

const RICE_ACCOUNT_CODE = "63101004";
const RICE_ACCOUNT_NOTE = "Rice";

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function parseAmount(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

function digitKey(value: string): string {
  return digitsOf(value).replace(/^0+/, "") || "0";
}

export function parsePayrollDeductionWorkbook(data: ArrayBuffer | Buffer): PayrollDeductionRow[] {
  const workbook = XLSX.read(data, { type: "buffer" });
  const rows: PayrollDeductionRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    if (/^summary$/i.test(sheetName.trim())) continue;
    const sheet = workbook.Sheets[sheetName];
    const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

    // Locate the header row: first row containing a STAFF ID column.
    let headerIndex = -1;
    let columnIndex: Record<string, number> = {};
    for (let i = 0; i < Math.min(grid.length, 15); i++) {
      const row = grid[i] ?? [];
      const found: Record<string, number> = {};
      row.forEach((cell, col) => {
        const key = HEADER_MAP[normalizeHeader(cell)];
        if (key && found[key] === undefined) found[key] = col;
      });
      if (found.staffId !== undefined && found.savings !== undefined) {
        headerIndex = i;
        columnIndex = found;
        break;
      }
    }
    if (headerIndex === -1) continue;

    const cell = (row: unknown[], key: string) =>
      columnIndex[key] !== undefined ? row[columnIndex[key]] : undefined;

    for (let i = headerIndex + 1; i < grid.length; i++) {
      const row = grid[i] ?? [];
      const staffId = String(cell(row, "staffId") ?? "").trim();
      if (!staffId) continue;

      rows.push({
        staffId,
        name: String(cell(row, "name") ?? "").trim(),
        savings: parseAmount(cell(row, "savings")),
        schoolFees: parseAmount(cell(row, "schoolFees")),
        quickCash: parseAmount(cell(row, "quickCash")),
        land: parseAmount(cell(row, "land")),
        rice: parseAmount(cell(row, "rice")),
        interest: {
          project: parseAmount(cell(row, "intProject")),
          other: parseAmount(cell(row, "intOther")),
          rent: parseAmount(cell(row, "intRent")),
          personal: parseAmount(cell(row, "intPersonal")),
          car: parseAmount(cell(row, "intCar")),
        },
      });
    }
  }

  return rows;
}

function rowHasActivity(row: PayrollDeductionRow): boolean {
  return (
    row.savings !== 0 ||
    row.schoolFees !== 0 ||
    row.quickCash !== 0 ||
    row.land !== 0 ||
    row.rice !== 0 ||
    INTEREST_LABELS.some(({ key }) => row.interest[key] !== 0)
  );
}

type EmployeeLite = {
  id: string;
  employee_no: string;
  first_name: string | null;
  last_name: string | null;
};

function buildEmployeeLookup(employees: EmployeeLite[]) {
  const exact = new Map<string, EmployeeLite>();
  const byDigits = new Map<string, EmployeeLite>();
  const digitCollisions = new Set<string>();

  for (const emp of employees) {
    const no = String(emp.employee_no ?? "").trim();
    if (!no) continue;
    exact.set(no.toUpperCase(), emp);
    exact.set(no, emp);
    const key = digitKey(no);
    if (byDigits.has(key) && byDigits.get(key)!.id !== emp.id) {
      digitCollisions.add(key);
    } else {
      byDigits.set(key, emp);
    }
  }
  for (const key of digitCollisions) byDigits.delete(key);

  return (staffId: string): EmployeeLite | null => {
    const raw = staffId.trim();
    const upper = raw.toUpperCase();
    for (const candidate of [raw, upper, `T${raw}`, `P${raw}`, `T${upper}`, `P${upper}`]) {
      const hit = exact.get(candidate) ?? exact.get(candidate.toUpperCase());
      if (hit) return hit;
    }
    // Payroll staff IDs are bare digits; employee_no carries a T/P series prefix.
    const digits = digitsOf(raw);
    if (digits) {
      const hit = byDigits.get(digitKey(raw));
      if (hit) return hit;
    }
    return null;
  };
}

async function fetchInChunks<T>(
  client: AppSupabase,
  table: string,
  select: string,
  column: string,
  ids: string[]
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await (client as any)
      .from(table)
      .select(select)
      .in(column, ids.slice(i, i + 100));
    if (error) throw new Error(`${table} lookup failed: ${error.message}`);
    out.push(...((data ?? []) as T[]));
  }
  return out;
}

function periodStamp(period: { year: number; month: number }): string {
  return `${period.year}${String(period.month).padStart(2, "0")}`;
}

function periodLabel(period: { year: number; month: number }): string {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}

async function applySavingsDeduction(
  client: AppSupabase,
  employee: EmployeeLite,
  account: any,
  amount: number,
  tag: string,
  label: string,
  period: { year: number; month: number },
  userId: string,
  dryRun = false
): Promise<"posted" | "duplicate"> {
  const stamp = periodStamp(period);
  const { data: existing } = await client
    .from("savings_contributions")
    .select("id")
    .eq("savings_id", account.id)
    .eq("contribution_type", "monthly")
    .eq("period_year", period.year)
    .eq("period_month", period.month)
    .limit(1)
    .maybeSingle();
  if (existing) return "duplicate";

  if (dryRun) return "posted";

  const newBalance = Number(account.balance) + amount;
  const { error: updateError } = await client
    .from("savings")
    .update({ balance: newBalance })
    .eq("id", account.id);
  if (updateError) throw new Error(`Could not update ${label} balance: ${updateError.message}`);

  const reference = `PAY-${tag}-${stamp}-${employee.employee_no}`;
  const { error: insertError } = await client.from("savings_contributions").insert({
    savings_id: account.id,
    employee_id: employee.id,
    amount,
    contribution_type: "monthly",
    period_year: period.year,
    period_month: period.month,
    reference,
    recorded_by: userId,
    narration: `Payroll ${label} deduction for ${periodLabel(period)}`,
  });
  if (insertError) throw new Error(`Could not record ${label} contribution: ${insertError.message}`);
  return "posted";
}

async function getOrCreateRiceAccount(
  client: AppSupabase,
  employee: EmployeeLite,
  savings: any[],
  dryRun = false
): Promise<any> {
  const existing = savings.find(
    (a) => a.status === "active" && a.type === "special" && /rice/i.test(a.notes ?? "")
  );
  if (existing) return existing;

  if (dryRun) {
    return { id: "dry-run", employee_id: employee.id, type: "special", status: "active", balance: 0, notes: RICE_ACCOUNT_NOTE };
  }
  const accountNumber = `RIC-${employee.employee_no}`;
  const { data, error } = await client
    .from("savings")
    .insert({
      employee_id: employee.id,
      type: "special",
      status: "active",
      balance: 0,
      account_number: accountNumber,
      account_code: RICE_ACCOUNT_CODE,
      notes: RICE_ACCOUNT_NOTE,
    })
    .select("id, employee_id, type, status, balance, monthly_contribution, account_number, notes")
    .single();
  if (error) throw new Error(`Could not create Rice savings account: ${error.message}`);
  savings.push(data);
  return data;
}

const ACTIVE_LOAN_STATUSES = ["active", "disbursed", "repaying"];

async function applyLoanGroup(
  client: AppSupabase,
  employee: EmployeeLite,
  loans: any[],
  productIds: Set<string>,
  amount: number,
  tag: string,
  label: string,
  period: { year: number; month: number },
  userId: string,
  dryRun = false
): Promise<number> {
  const stamp = periodStamp(period);
  const candidates = loans
    .filter(
      (l) =>
        productIds.has(l.loan_product_id) &&
        ACTIVE_LOAN_STATUSES.includes(l.status) &&
        Number(l.outstanding_balance) > 0
    )
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));

  if (candidates.length === 0) {
    throw new Error(`No active ${label} loan for ${employee.employee_no}.`);
  }

  // Waterfall: each loan absorbs up to its scheduled monthly repayment,
  // oldest first; any remainder lands on the oldest loan.
  let remaining = amount;
  const payments: { loan: any; amount: number }[] = [];
  for (const loan of candidates) {
    if (remaining <= 0) break;
    const scheduled = Number(loan.monthly_repayment) || 0;
    const cap = scheduled > 0 ? scheduled : Number(loan.outstanding_balance);
    const pay = Math.min(remaining, cap, Number(loan.outstanding_balance));
    if (pay > 0) {
      payments.push({ loan, amount: pay });
      remaining -= pay;
    }
  }
  if (remaining > 0.004 && payments.length > 0) {
    payments[0].amount += remaining;
    remaining = 0;
  }
  if (remaining > 0.004) {
    throw new Error(`Could not allocate ${label} recovery of ${remaining.toFixed(2)} for ${employee.employee_no}.`);
  }

  const paidDate = new Date(period.year, period.month - 1, 1).toISOString();
  let posted = 0;

  for (const { loan, amount: pay } of payments) {
    const reference = `PAY-${tag}-${stamp}-${employee.employee_no}-${String(loan.id).slice(0, 8)}`;
    const { data: existing } = await client
      .from("repayments")
      .select("id")
      .eq("reference", reference)
      .limit(1)
      .maybeSingle();
    if (existing) continue;
    if (dryRun) {
      posted++;
      continue;
    }

    const newBalance = Math.max(0, Number(loan.outstanding_balance) - pay);
    const { error: loanError } = await client
      .from("loans")
      .update({
        outstanding_balance: newBalance,
        status: newBalance === 0 ? "completed" : "repaying",
      })
      .eq("id", loan.id);
    if (loanError) throw new Error(`Could not update ${label} loan balance: ${loanError.message}`);

    const { error: repayError } = await client.from("repayments").insert({
      loan_id: loan.id,
      employee_id: employee.id,
      installment_no: 0,
      amount_due: pay,
      amount_paid: pay,
      due_date: paidDate,
      status: "paid",
      paid_date: paidDate,
      principal_component: pay,
      interest_component: 0,
      payment_method: "payroll",
      reference,
      notes: `Payroll ${label} recovery for ${periodLabel(period)}`,
    });
    if (repayError) throw new Error(`Could not record ${label} repayment: ${repayError.message}`);
    posted++;
  }

  return posted;
}

async function recordInterest(
  client: AppSupabase,
  employee: EmployeeLite,
  balanceBasis: number,
  amount: number,
  tag: string,
  label: string,
  period: { year: number; month: number },
  userId: string,
  dryRun = false
): Promise<boolean> {
  const stamp = periodStamp(period);
  const reference = `PAY-INT-${stamp}-${employee.employee_no}-${tag}`;
  const { data: existing } = await client
    .from("transactions")
    .select("id")
    .eq("reference", reference)
    .limit(1)
    .maybeSingle();
  if (existing) return false;
  if (dryRun) return true;

  const { error } = await client.from("transactions").insert({
    reference,
    employee_id: employee.id,
    type: "interest",
    amount,
    balance_before: balanceBasis,
    balance_after: balanceBasis,
    description: `Payroll loan interest recovery — ${label} (${periodLabel(period)})`,
    related_type: "payroll",
    performed_by: userId,
  });
  if (error) throw new Error(`Could not record ${label} interest: ${error.message}`);
  return true;
}

export async function processPayrollDeductionFile(
  rows: PayrollDeductionRow[],
  period: { year: number; month: number },
  userId: string,
  options?: { dryRun?: boolean }
): Promise<PayrollDeductionResult> {
  const dryRun = options?.dryRun === true;
  const active = rows.filter(rowHasActivity);
  if (active.length === 0) {
    return { processed: 0, skipped: 0, riceAccountsCreated: 0, interestRecorded: 0, errors: ["The file is empty or has no deduction rows."] };
  }

  const client = createAdminClient();
  const errors: string[] = [];

  const { data: employees, error: empError } = await client
    .from("employees")
    .select("id, employee_no, first_name, last_name")
    .eq("status", "active")
    .limit(5000);
  if (empError) throw new Error(`Could not load employees: ${empError.message}`);

  const lookup = buildEmployeeLookup((employees ?? []) as EmployeeLite[]);
  const matched: { row: PayrollDeductionRow; employee: EmployeeLite; rowNo: number }[] = [];
  let skipped = 0;
  active.forEach((row, i) => {
    const rowNo = i + 2;
    const employee = lookup(row.staffId);
    if (!employee) {
      errors.push(`Row ${rowNo}: Staff ID "${row.staffId}" was not found.`);
      return;
    }
    matched.push({ row, employee, rowNo });
  });

  const employeeIds = [...new Set(matched.map((m) => m.employee.id))];
  const [savingsAll, loansAll, productsRes] = await Promise.all([
    fetchInChunks<any>(client, "savings", "id, employee_id, type, status, balance, monthly_contribution, account_number, notes", "employee_id", employeeIds),
    fetchInChunks<any>(client, "loans", "id, employee_id, loan_product_id, outstanding_balance, monthly_repayment, status, created_at", "employee_id", employeeIds),
    client.from("loan_products").select("id, name, account_code"),
  ]);
  if (productsRes.error) throw new Error(`Could not load loan products: ${productsRes.error.message}`);

  const products = (productsRes.data ?? []) as any[];
  const schoolFeesIds = new Set(products.filter((p) => p.name === "School Fees").map((p) => p.id));
  const landIds = new Set(
    products.filter((p) => p.account_code === "62141001" || p.name === "Land" || p.name === "Land Loan").map((p) => p.id)
  );

  const savingsByEmp = new Map<string, any[]>();
  for (const s of savingsAll) {
    const list = savingsByEmp.get(s.employee_id) ?? [];
    list.push(s);
    savingsByEmp.set(s.employee_id, list);
  }
  const loansByEmp = new Map<string, any[]>();
  for (const l of loansAll) {
    const list = loansByEmp.get(l.employee_id) ?? [];
    list.push(l);
    loansByEmp.set(l.employee_id, list);
  }

  let processed = 0;
  let riceAccountsCreated = 0;
  let interestRecorded = 0;

  for (const { row, employee, rowNo } of matched) {
    try {
      const savings = savingsByEmp.get(employee.id) ?? [];
      const loans = loansByEmp.get(employee.id) ?? [];
      const activeLoans = loans.filter((l) => ACTIVE_LOAN_STATUSES.includes(l.status));
      const balanceBasis = activeLoans.reduce((sum, l) => sum + Math.max(0, Number(l.outstanding_balance) || 0), 0);

      // ── Savings pots ──────────────────────────────────────────────
      if (row.savings !== 0) {
        const account = savings.find((a) => a.status === "active" && a.type === "regular");
        if (!account) throw new Error(`No active savings account.`);
        await applySavingsDeduction(client, employee, account, row.savings, "SAV", "savings", period, userId, dryRun);
      }

      if (row.quickCash !== 0) {
        const account = savings.find(
          (a) => a.status === "active" && a.type === "special" && !/rice/i.test(a.notes ?? "")
        );
        if (!account) throw new Error(`No active Quick-Cash savings account.`);
        await applySavingsDeduction(client, employee, account, row.quickCash, "QC", "Quick-Cash savings", period, userId, dryRun);
      }

      if (row.rice !== 0) {
        const hasRice = savings.some(
          (a) => a.status === "active" && a.type === "special" && /rice/i.test(a.notes ?? "")
        );
        if (!hasRice) riceAccountsCreated++;
        const account = await getOrCreateRiceAccount(client, employee, savings, dryRun);
        await applySavingsDeduction(client, employee, account, row.rice, "RICE", "Rice savings", period, userId, dryRun);
      }

      // ── Loan product recoveries ───────────────────────────────────
      if (row.schoolFees !== 0) {
        await applyLoanGroup(client, employee, loans, schoolFeesIds, row.schoolFees, "SF", "School Fees", period, userId, dryRun);
      }
      if (row.land !== 0) {
        await applyLoanGroup(client, employee, loans, landIds, row.land, "LAND", "Land", period, userId, dryRun);
      }

      // ── Loan interest recoveries (income, no principal impact) ────
      for (const { key, label, tag } of INTEREST_LABELS) {
        const amount = row.interest[key];
        if (amount !== 0) {
          if (await recordInterest(client, employee, balanceBasis, amount, tag, label, period, userId, dryRun)) {
            interestRecorded++;
          }
        }
      }

      processed++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row ${rowNo} (${row.staffId} ${row.name}): ${message}`);
    }
  }

  if (!dryRun) await client.from("audit_logs").insert({
    action: "bulk_import",
    table_name: "payroll_deduction_file",
    record_id: crypto.randomUUID(),
    performed_by: userId,
    new_values: {
      period: periodLabel(period),
      processed,
      skipped,
      rice_accounts_created: riceAccountsCreated,
      interest_recorded: interestRecorded,
      errors: errors.slice(0, 20),
    },
  });

  return { processed, skipped, riceAccountsCreated, interestRecorded, errors };
}

// ── Monthly template ──────────────────────────────────────────────────────────

export async function buildPayrollDeductionTemplateXlsx(): Promise<Buffer> {
  const client = createAdminClient();

  const { data: employees, error: empError } = await client
    .from("employees")
    .select("id, employee_no, first_name, last_name")
    .eq("status", "active")
    .order("employee_no", { ascending: true })
    .limit(5000);
  if (empError) throw new Error(`Could not load employees: ${empError.message}`);

  const empList = (employees ?? []) as EmployeeLite[];
  const ids = empList.map((e) => e.id);

  const [savingsAll, loansAll, productsRes] = await Promise.all([
    ids.length
      ? fetchInChunks<any>(client, "savings", "employee_id, type, status, monthly_contribution, notes", "employee_id", ids)
      : Promise.resolve([] as any[]),
    ids.length
      ? fetchInChunks<any>(client, "loans", "employee_id, loan_product_id, monthly_repayment, status", "employee_id", ids)
      : Promise.resolve([] as any[]),
    client.from("loan_products").select("id, name, account_code"),
  ]);
  if (productsRes.error) throw new Error(`Could not load loan products: ${productsRes.error.message}`);

  const templateProducts = (productsRes.data ?? []) as any[];
  const schoolFeesIds = new Set(templateProducts.filter((p) => p.name === "School Fees").map((p) => p.id));
  const landIds = new Set(
    templateProducts
      .filter((p) => p.account_code === "62141001" || p.name === "Land" || p.name === "Land Loan")
      .map((p) => p.id)
  );

  const savingsByEmp = new Map<string, any[]>();
  for (const s of savingsAll) {
    const list = savingsByEmp.get(s.employee_id) ?? [];
    list.push(s);
    savingsByEmp.set(s.employee_id, list);
  }
  const loansByEmp = new Map<string, any[]>();
  for (const l of loansAll) {
    if (!ACTIVE_LOAN_STATUSES.includes(l.status)) continue;
    const list = loansByEmp.get(l.employee_id) ?? [];
    list.push(l);
    loansByEmp.set(l.employee_id, list);
  }

  const header = [
    "#",
    "Staff ID",
    "Employee Name",
    "GTPEA SAVINGS",
    "GTPEA SCHOOL FEES",
    "GTPEA QUICK-CASH",
    "GTPEA LAND",
    "GTPEA RICE",
    "PROJECT LOAN INT",
    "OTHER LOAN INT",
    "RENT LOAN INT",
    "PERSONAL LOAN INT",
    "GTPEA CAR LOAN INT",
  ];

  const aoa: (string | number)[][] = [header];
  empList.forEach((emp, i) => {
    const sav = savingsByEmp.get(emp.id) ?? [];
    const regular = sav.find((a) => a.status === "active" && a.type === "regular");
    const quickCash = sav.find((a) => a.status === "active" && a.type === "special" && !/rice/i.test(a.notes ?? ""));
    const rice = sav.find((a) => a.status === "active" && a.type === "special" && /rice/i.test(a.notes ?? ""));
    const loans = loansByEmp.get(emp.id) ?? [];
    const sumLoans = (ids: Set<string>) =>
      loans
        .filter((l) => ids.has(l.loan_product_id))
        .reduce((sum, l) => sum + Math.max(0, Number(l.monthly_repayment) || 0), 0);

    // Payroll Staff IDs are bare digits; employee_no carries the T/P series prefix.
    const staffId = String(emp.employee_no ?? "").replace(/^[TP]/i, "");
    aoa.push([
      i + 1,
      staffId,
      `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
      Number(regular?.monthly_contribution) || 0,
      Number(sumLoans(schoolFeesIds).toFixed(2)),
      Number(quickCash?.monthly_contribution) || 0,
      Number(sumLoans(landIds).toFixed(2)),
      Number(rice?.monthly_contribution) || 0,
      0, 0, 0, 0, 0,
    ]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet["!cols"] = [
    { wch: 5 }, { wch: 10 }, { wch: 32 },
    ...Array.from({ length: 10 }, () => ({ wch: 16 })),
  ];

  const instructions = XLSX.utils.aoa_to_sheet([
    ["GTPEA Monthly Payroll Deductions — how to use"],
    [""],
    ["1. Enter the deduction amounts for the month in the GTPEA Deductions sheet."],
    ["2. Save the file and upload it from the Payroll Master File panel (Admin / Fund Manager)."],
    ["3. Columns: GTPEA SAVINGS = regular savings; GTPEA QUICK-CASH = quick-cash savings;"],
    ["   GTPEA RICE = rice savings; GTPEA SCHOOL FEES / GTPEA LAND = loan recoveries;"],
    ["   *LOAN INT columns = interest recovered (recorded as interest income)."],
    ["4. Rows with all zeros are ignored. Staff IDs not found are reported as errors."],
    ["5. Re-uploading the same month is safe — already-posted rows are skipped."],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "GTPEA Deductions");
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
