import { parseCsv } from "@/lib/csv";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSupabase } from "@/lib/supabase/types";

export type PayrollMasterRow = {
  employeeNo: string;
  name: string;
  department: string;
  savingsContribution: number;
  loanPayment: number;
  withdrawalAmount: number;
};

export type PayrollMasterResult = {
  processed: number;
  errors: string[];
};

export function parsePayrollMasterFile(csvText: string): PayrollMasterRow[] {
  const rows = parseCsv(csvText);
  return rows.map((row) => ({
    employeeNo: String(row["staff id"] ?? row["employee no"] ?? row["employee id"] ?? "").trim(),
    name: String(row["staff name"] ?? row.name ?? "").trim(),
    department: String(row.department ?? "").trim(),
    savingsContribution: Math.max(0, Number(row["savings contribution"] ?? row.savings ?? 0) || 0),
    loanPayment: Math.max(0, Number(row["loan payment"] ?? row.loan ?? row["loan repayment"] ?? 0) || 0),
    withdrawalAmount: Math.max(0, Number(row["withdrawal amount"] ?? row.withdrawal ?? 0) || 0),
  }));
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
    "Total Withdrawals",
    "Savings Contribution",
    "Loan Payment",
    "Withdrawal Amount",
  ];
  const sample = [
    "TSG001",
    "Kwame Mensah",
    "Operations",
    "200.00",
    "100.00",
    "0.00",
    "100.00",
    "50.00",
    "0.00",
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

    if (!Number.isFinite(row.savingsContribution) || !Number.isFinite(row.loanPayment) || !Number.isFinite(row.withdrawalAmount)) {
      errors.push(`Row ${rowNo}: Invalid numeric value for ${row.employeeNo}.`);
      continue;
    }

    if (row.savingsContribution === 0 && row.loanPayment === 0 && row.withdrawalAmount === 0) {
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
      due_date: new Date().toISOString(),
      status: "paid",
      paid_date: new Date().toISOString(),
    });

    if (repaymentError) {
      throw new Error(`Could not record loan repayment for ${row.employeeNo}: ${repaymentError.message}`);
    }
  }

  // Withdrawal: add to cumulative withdrawal history.
  if (row.withdrawalAmount > 0) {
    const { data: savings } = await client
      .from("savings")
      .select("id")
      .eq("employee_id", employee.id)
      .eq("status", "active")
      .limit(1)
      .single();

    const reference = `PAY-${period.year}${String(period.month).padStart(2, "0")}-${employee.employee_no}-${Date.now().toString(36).slice(-4)}`;
    const { error: withdrawalError } = await client.from("withdrawal_requests").insert({
      request_ref: reference,
      employee_id: employee.id,
      savings_id: savings?.id ?? null,
      amount: row.withdrawalAmount,
      reason: "Payroll withdrawal",
      status: "disbursed",
      requested_at: new Date().toISOString(),
      disbursement_date: new Date().toISOString(),
      disbursed_by: userId,
    });

    if (withdrawalError) {
      throw new Error(`Could not record withdrawal for ${row.employeeNo}: ${withdrawalError.message}`);
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

  const [savingsRes, loansRes, withdrawalRes] = await Promise.all([
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
    empIds.length > 0
      ? adminClient
          .from("withdrawal_requests")
          .select("employee_id, amount")
          .in("employee_id", empIds)
          .in("status", ["approved", "disbursed"])
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

  const withdrawalsByEmp: Record<string, number> = {};
  for (const w of (withdrawalRes.data ?? []) as any[]) {
    withdrawalsByEmp[w.employee_id] = (withdrawalsByEmp[w.employee_id] ?? 0) + Number(w.amount);
  }

  const headers = [
    "Staff ID",
    "Staff Name",
    "Department",
    "Current Savings Balance",
    "Current Loan Balance",
    "Total Withdrawals",
    "Savings Contribution",
    "Loan Payment",
    "Withdrawal Amount",
  ];

  const rows = (employees ?? []).map((emp: any) => {
    const name = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
    return [
      escapeCsv(emp.employee_no),
      escapeCsv(name),
      escapeCsv(emp.department ?? ""),
      (savingsByEmp[emp.id] ?? 0).toFixed(2),
      (loansByEmp[emp.id] ?? 0).toFixed(2),
      (withdrawalsByEmp[emp.id] ?? 0).toFixed(2),
      "0.00",
      "0.00",
      "0.00",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
