import { parseCsv } from "@/lib/csv";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSupabase } from "@/lib/supabase/types";

export type PayrollMasterRow = {
  employeeNo: string;
  name: string;
  department: string;
  savingsContribution: number;
  loanPayment: number;
};

export type PayrollMasterResult = {
  processed: number;
  errors: string[];
};

export function parsePayrollMasterFile(fileText: string): PayrollMasterRow[] {
  const rows = parseCsv(fileText);
  const parsedRows = rows.flatMap((row) => {
    const employeeNo = String(
      row["staff id"] ?? row["employee no"] ?? row["employee id"] ?? row["emp numb"] ?? row["emp number"] ?? ""
    ).trim();
    const name = String(row["staff name"] ?? row.name ?? row["surname & othernames"] ?? "").trim();
    const department = String(row.department ?? "").trim();
    const allowanceName = String(
      row["allowance name"] ?? row.allowance ?? row.description ?? row["allowance code"] ?? row.code ?? ""
    ).trim();
    const amount = parsePayrollAmount(row.amount ?? row["allowance amount"] ?? "0");

    if (allowanceName) {
      const category = payrollCategory(allowanceName);
      if (!category) return [];
      return [{
        employeeNo,
        name,
        department,
        savingsContribution: category === "savings" ? amount : 0,
        loanPayment: category === "loan" ? amount : 0,
      }];
    }

    return [{
      employeeNo,
      name,
      department,
      savingsContribution: parsePayrollAmount(row["savings contribution"] ?? row.savings ?? "0"),
      loanPayment: parsePayrollAmount(row["loan payment"] ?? row.loan ?? row["loan repayment"] ?? row["loan recovery"] ?? "0"),
    }];
  });

  if (parsedRows.some((row) => row.employeeNo)) return parsedRows;

  return fileText.split(/\r?\n/).flatMap((line) => {
    const category = payrollCategory(line);
    const employeeMatch = line.match(/^\s*([A-Za-z0-9-]{4,})\b/);
    const amountMatch = line.match(/\b\d[\d,]*\.\d{2}\b/);
    if (!category || !employeeMatch || !amountMatch) return [];
    const amount = parsePayrollAmount(amountMatch[0]);
    return [{
      employeeNo: employeeMatch[1],
      name: "",
      department: "",
      savingsContribution: category === "savings" ? amount : 0,
      loanPayment: category === "loan" ? amount : 0,
    }];
  });
}

function parsePayrollAmount(value: string): number {
  return Math.max(0, Number(String(value).replace(/,/g, "")) || 0);
}

function payrollCategory(value: string): "savings" | "loan" | null {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (/\bloan\s*(reco|recovery|repayment|payment)\b/.test(normalized)) return "loan";
  if (/\bsavings?\b/.test(normalized)) return "savings";
  return null;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildPayrollMasterTemplate(): string {
  const headers = [
    "Staff ID",
    "Staff Name",
    "Department",
    "Current Savings Balance",
    "Current Loan Balance",
    "Savings Contribution",
    "Loan Payment",
  ];
  const sample = [
    "TSG001",
    "Kwame Mensah",
    "Operations",
    "200.00",
    "100.00",
    "100.00",
    "50.00",
  ];
  return [headers.join(","), sample.join(",")].join("\n");
}

export async function processPayrollMasterFile(
  rows: PayrollMasterRow[],
  period: { year: number; month: number },
  userId: string
): Promise<PayrollMasterResult> {
  if (rows.length === 0) {
    return { processed: 0, errors: ["The file is empty or has no data rows."] };
  }

  const adminClient = createAdminClient();
  const errors: string[] = [];

  // Validation pass: ensure every row can be matched before applying changes.
  const employeeNos = rows.map((row) => row.employeeNo).filter(Boolean);
  const { data: employees } = await adminClient
    .from("employees")
    .select("id, employee_no, first_name, last_name")
    .in("employee_no", employeeNos);

  const employeeByNo = new Map((employees ?? []).map((e: any) => [e.employee_no, e]));

  const validRows: { row: PayrollMasterRow; rowNo: number; employee: any }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    if (!row.employeeNo) {
      errors.push(`Row ${rowNo}: Staff ID is required.`);
      continue;
    }

    const employee = employeeByNo.get(row.employeeNo);
    if (!employee) {
      errors.push(`Row ${rowNo}: Staff ID "${row.employeeNo}" was not found.`);
      continue;
    }

    if (!Number.isFinite(row.savingsContribution) || !Number.isFinite(row.loanPayment)) {
      errors.push(`Row ${rowNo}: Invalid numeric value for ${row.employeeNo}.`);
      continue;
    }

    if (row.savingsContribution === 0 && row.loanPayment === 0) {
      // Skip rows with no activity but do not treat as an error.
      continue;
    }

    validRows.push({ row, rowNo, employee });
  }

  if (errors.length > 0) {
    return { processed: 0, errors };
  }

  let processed = 0;

  for (const { row, rowNo, employee } of validRows) {
    try {
      await processRow(adminClient, row, employee, period, userId);
      processed++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row ${rowNo}: ${message}`);
    }
  }

  await adminClient.from("audit_logs").insert({
    action: "bulk_import",
    table_name: "payroll_master_file",
    record_id: crypto.randomUUID(),
    performed_by: userId,
    new_values: {
      period: `${period.year}-${String(period.month).padStart(2, "0")}`,
      processed,
      errors: errors.slice(0, 20),
    },
  });

  return { processed, errors };
}

async function processRow(
  client: AppSupabase,
  row: PayrollMasterRow,
  employee: any,
  period: { year: number; month: number },
  userId: string
) {
  // Savings contribution: add to balance and record contribution.
  if (row.savingsContribution > 0) {
    const { data: savings } = await client
      .from("savings")
      .select("id, balance")
      .eq("employee_id", employee.id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!savings) {
      throw new Error(`No active savings account for ${row.employeeNo}.`);
    }

    // Prevent duplicate monthly payroll contribution for the same period.
    const { data: existingContribution } = await client
      .from("savings_contributions")
      .select("id")
      .eq("employee_id", employee.id)
      .eq("savings_id", savings.id)
      .eq("contribution_type", "monthly")
      .eq("period_year", period.year)
      .eq("period_month", period.month)
      .limit(1)
      .single();

    if (existingContribution) {
      throw new Error(
        `A monthly savings contribution for ${row.employeeNo} already exists for ${period.year}-${String(period.month).padStart(2, "0")}.`
      );
    }

    const newBalance = Number(savings.balance) + row.savingsContribution;
    const { error: updateError } = await client
      .from("savings")
      .update({ balance: newBalance })
      .eq("id", savings.id);

    if (updateError) {
      throw new Error(`Could not update savings balance for ${row.employeeNo}: ${updateError.message}`);
    }

    const contributionReference = `PAY-SAV-${period.year}${String(period.month).padStart(2, "0")}-${employee.employee_no}`;
    const { error: contributionError } = await client.from("savings_contributions").insert({
      savings_id: savings.id,
      employee_id: employee.id,
      amount: row.savingsContribution,
      contribution_type: "monthly",
      period_year: period.year,
      period_month: period.month,
      reference: contributionReference,
      recorded_by: userId,
      narration: `Payroll contribution for ${period.year}-${String(period.month).padStart(2, "0")}`,
    });

    if (contributionError) {
      throw new Error(`Could not record savings contribution for ${row.employeeNo}: ${contributionError.message}`);
    }
  }

  // Loan payment: subtract from outstanding balance and record repayment.
  if (row.loanPayment > 0) {
    const { data: loan } = await client
      .from("loans")
      .select("id, outstanding_balance")
      .eq("employee_id", employee.id)
      .in("status", ["disbursed", "repaying"])
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!loan) {
      throw new Error(`No active loan for ${row.employeeNo}.`);
    }

    const repaymentReference = `PAY-LOAN-${period.year}${String(period.month).padStart(2, "0")}-${employee.employee_no}`;
    const { data: existingRepayment } = await client
      .from("repayments")
      .select("id")
      .eq("reference", repaymentReference)
      .limit(1)
      .single();

    if (existingRepayment) {
      throw new Error(
        `A loan recovery for ${row.employeeNo} already exists for ${period.year}-${String(period.month).padStart(2, "0")}.`
      );
    }

    const newBalance = Math.max(0, Number(loan.outstanding_balance) - row.loanPayment);
    const { error: loanUpdateError } = await client
      .from("loans")
      .update({
        outstanding_balance: newBalance,
        status: newBalance === 0 ? "completed" : "repaying",
      })
      .eq("id", loan.id);

    if (loanUpdateError) {
      throw new Error(`Could not update loan balance for ${row.employeeNo}: ${loanUpdateError.message}`);
    }

    const { error: repaymentError } = await client.from("repayments").insert({
      loan_id: loan.id,
      employee_id: employee.id,
      installment_no: 0,
      amount_due: row.loanPayment,
      amount_paid: row.loanPayment,
      due_date: new Date(period.year, period.month - 1, 1).toISOString(),
      status: "paid",
      paid_date: new Date(period.year, period.month - 1, 1).toISOString(),
      principal_component: row.loanPayment,
      interest_component: 0,
      payment_method: "payroll",
      reference: repaymentReference,
      notes: `Payroll loan recovery for ${period.year}-${String(period.month).padStart(2, "0")}`,
    });

    if (repaymentError) {
      throw new Error(`Could not record loan repayment for ${row.employeeNo}: ${repaymentError.message}`);
    }
  }
}

export async function exportPayrollMasterFile(): Promise<string> {
  const adminClient = createAdminClient();
  const { data: employees } = await adminClient
    .from("employees")
    .select("id, employee_no, first_name, last_name, department, salary")
    .eq("status", "active")
    .order("employee_no", { ascending: true });

  const empIds = (employees ?? []).map((e: any) => e.id);

  const [savingsRes, loansRes] = await Promise.all([
    empIds.length > 0
      ? adminClient.from("savings").select("employee_id, balance").in("employee_id", empIds).eq("status", "active")
      : Promise.resolve({ data: [] }),
    empIds.length > 0
      ? adminClient
          .from("loans")
          .select("employee_id, outstanding_balance")
          .in("employee_id", empIds)
          .in("status", ["disbursed", "repaying"])
      : Promise.resolve({ data: [] }),
  ]);

  const savingsByEmp: Record<string, number> = {};
  for (const s of (savingsRes.data ?? []) as any[]) {
    savingsByEmp[s.employee_id] = (savingsByEmp[s.employee_id] ?? 0) + Number(s.balance);
  }

  const loansByEmp: Record<string, number> = {};
  for (const l of (loansRes.data ?? []) as any[]) {
    loansByEmp[l.employee_id] = (loansByEmp[l.employee_id] ?? 0) + Number(l.outstanding_balance);
  }

  const headers = [
    "Staff ID",
    "Staff Name",
    "Department",
    "Current Savings Balance",
    "Current Loan Balance",
    "Savings Contribution",
    "Loan Payment",
  ];

  const rows = (employees ?? []).map((emp: any) => {
    const name = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
    return [
      escapeCsv(emp.employee_no),
      escapeCsv(name),
      escapeCsv(emp.department ?? ""),
      (savingsByEmp[emp.id] ?? 0).toFixed(2),
      (loansByEmp[emp.id] ?? 0).toFixed(2),
      "0.00",
      "0.00",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
