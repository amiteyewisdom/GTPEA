import { parseCsv } from "@/lib/csv";
import type { AppSupabase } from "@/lib/supabase/types";

export type ImportType = "employees" | "savings" | "loans";

const VALID_DEPARTMENTS = ["management", "finance", "operations", "hr", "it", "sales", "legal", "audit"] as const;

type Department = (typeof VALID_DEPARTMENTS)[number];

function normalizeDepartment(input: string): Department {
  const raw = input.trim().toLowerCase().replace(/[&\/_-]/g, " ");

  const aliases: Record<Department, string[]> = {
    management: ["management", "mgt", "mgr", "managerial"],
    finance: ["finance", "fin", "account", "accounts", "accounting", "bac"],
    operations: [
      "operations",
      "ops",
      "operational",
      "procurement",
      "warehouse",
      "logistics",
      "admin",
      "administration",
      "support",
      "user support",
      "customer support",
      "general services",
      "gs",
      "planning",
      "data kitchen",
      "color kitchen",
      "kitchen",
    ],
    hr: ["hr", "human resources", "human resource", "personnel"],
    it: ["it", "information technology", "information tech", "tech", "technology", "engineering"],
    sales: ["sales", "marketing", "business development", "biz dev"],
    legal: ["legal", "compliance"],
    audit: ["audit", "internal audit"],
  };

  if (VALID_DEPARTMENTS.includes(raw as Department)) return raw as Department;

  for (const [department, departmentAliases] of Object.entries(aliases)) {
    if (departmentAliases.includes(raw)) return department as Department;
  }

  return "operations";
}

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export function resolveEmployeeNo(row: Record<string, string>): string {
  const numberValue = String(row["no."] ?? row["no"] ?? row["num"] ?? row["number"] ?? "").trim();
  const coyValue = String(row["coy"] ?? row["cop"] ?? row["company"] ?? "").trim().toUpperCase();
  if (coyValue && numberValue) return `${coyValue}${numberValue}`;
  const unoValue = String(row["uno"] ?? row["union no"] ?? row["union number"] ?? "").trim();
  if (unoValue) return unoValue;
  return String(
    row["employee no"] ??
    row["employee id"] ??
    row["staff id"] ??
    row["emp numb"] ??
    row["emp number"] ??
    row["employee number"] ??
    ""
  ).trim();
}

export function resolveEmployeeName(row: Record<string, string>): { firstName: string; lastName: string } {
  const fullName = String(
    row["payee name"] ||
    row["hr name"] ||
    row["staff name"] ||
    row["surname & othernames"] ||
    (row["first name"] ? `${row["first name"]} ${row["last name"] ?? ""}`.trim() : "") ||
    row.name ||
    ""
  ).trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

export function normalizeLoanProductName(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, " ");
  const aliases: Record<string, string> = {
    "regular loan": "normal loan",
  };

  return aliases[normalized] ?? normalized;
}

function parseImportDate(value: string): Date | null {
  const match = value.trim().match(/^(?:(\d{4})-(\d{2})-(\d{2})|(\d{2})\/(\d{2})\/(\d{4}))$/);
  if (!match) return null;

  const year = Number(match[1] ?? match[6]);
  const month = Number(match[2] ?? match[5]);
  const day = Number(match[3] ?? match[4]);
  const parsed = new Date(year, month - 1, day);

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }

  return parsed;
}

export async function processImport(
  supabase: AppSupabase,
  type: ImportType,
  fileText: string,
  userId: string
): Promise<ImportResult> {
  const rows = parseCsv(fileText);
  if (rows.length === 0) {
    return { imported: 0, skipped: 0, errors: ["The file is empty or has no data rows."] };
  }

  switch (type) {
    case "employees":
      return importEmployees(supabase, rows, userId);
    case "savings":
      return importSavings(supabase, rows, userId);
    case "loans":
      return importLoans(supabase, rows);
    default:
      return { imported: 0, skipped: 0, errors: ["Unknown import type."] };
  }
}

async function importEmployees(
  supabase: AppSupabase,
  rows: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const employeeNo = resolveEmployeeNo(row);
    const { firstName, lastName: rawLastName } = resolveEmployeeName(row);
    const lastName = rawLastName || "-";
    const bankAccountNo = row["payee account"] || row["account number"] || row["bank account no"] || null;
    const email = row.email || (employeeNo ? `${employeeNo.toLowerCase()}@staff.gtpea.local` : "");
    const department = normalizeDepartment(row.department || row["coy"] || "operations");
    const position = row.position || "Staff";
    const joinDate = row["join date"] || new Date().toISOString().slice(0, 10);
    const salary = parseFloat(row.salary || "0");

    if (!employeeNo || !firstName) {
      skipped++;
      errors.push(`Row ${rowNo}: missing employee no or name.`);
      continue;
    }

    const { error } = await supabase.from("employees").upsert(
      {
        employee_no: employeeNo,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: row.phone || null,
        department,
        position,
        bank_account_no: bankAccountNo,
        date_joined: joinDate,
        salary: Number.isFinite(salary) ? salary : 0,
        status: row.status || "active",
        created_by: userId,
      },
      { onConflict: "employee_no" }
    );

    if (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error.message}`);
    } else {
      imported++;
    }
  }

  return { imported, skipped, errors };
}

async function importSavings(
  supabase: AppSupabase,
  rows: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const employeeNo = resolveEmployeeNo(row);
    const amount = parseFloat(row.amount);
    const date = row.date || Object.entries(row).find(([header]) => header.startsWith("date"))?.[1] || new Date().toISOString().slice(0, 10);
    const accountNumber = row["account number"];

    if (!employeeNo || !Number.isFinite(amount) || amount <= 0) {
      skipped++;
      errors.push(`Row ${rowNo}: employee no and a positive amount are required.`);
      continue;
    }

    const parsedDate = parseImportDate(date);
    if (!parsedDate) {
      skipped++;
      errors.push(`Row ${rowNo}: date "${date}" is not valid. Use YYYY-MM-DD or DD/MM/YYYY format.`);
      continue;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", employeeNo)
      .single();

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${employeeNo} was not found.`);
      continue;
    }

    let savingsId: string | null = null;

    if (accountNumber) {
      const { data: savings } = await supabase
        .from("savings")
        .select("id")
        .eq("account_number", accountNumber)
        .eq("employee_id", employee.id)
        .single();
      savingsId = savings?.id ?? null;
    } else {
      const { data: savings } = await supabase
        .from("savings")
        .select("id")
        .eq("employee_id", employee.id)
        .eq("status", "active")
        .limit(1)
        .single();
      savingsId = savings?.id ?? null;
    }

    if (!savingsId) {
      const newAccount = `SAV-${employeeNo}-${Date.now().toString().slice(-6)}`;
      const { data: created, error: createError } = await supabase
        .from("savings")
        .insert({
          employee_id: employee.id,
          account_number: newAccount,
          type: "regular",
          status: "active",
          balance: amount,
          monthly_contribution: amount,
        })
        .select("id")
        .single();

      if (createError || !created) {
        skipped++;
        errors.push(`Row ${rowNo}: could not create savings account.`);
        continue;
      }
      savingsId = created.id;
    }

    const reference = `IMP-${employeeNo}-${parsedDate.getFullYear()}${parsedDate.getMonth() + 1}-${i + 1}`;

    const { error: contributionError } = await supabase.from("savings_contributions").insert({
      savings_id: savingsId,
      employee_id: employee.id,
      amount,
      contribution_type: (row.type || "monthly").toLowerCase().includes("voluntary") ? "voluntary" : "monthly",
      period_year: parsedDate.getFullYear(),
      period_month: parsedDate.getMonth() + 1,
      reference,
      recorded_by: userId,
      narration: `Imported on ${date}`,
    });

    if (contributionError) {
      skipped++;
      errors.push(`Row ${rowNo}: ${contributionError.message}`);
      continue;
    }

    const { data: account } = await supabase
      .from("savings")
      .select("balance")
      .eq("id", savingsId)
      .single();

    if (account) {
      await supabase
        .from("savings")
        .update({ balance: Number(account.balance) + amount })
        .eq("id", savingsId);
    }

    imported++;
  }

  return { imported, skipped, errors };
}

async function importLoans(supabase: AppSupabase, rows: Record<string, string>[]): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  const { data: products } = await supabase.from("loan_products").select("id, name");
  const productMap = new Map((products ?? []).map((p: { id: string; name: string }) => [p.name.toLowerCase(), p.id]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const loanRef = row.reference || row["loan ref"];
    const employeeNo = resolveEmployeeNo(row);
    const productName = normalizeLoanProductName(row.product || "Normal Loan");
    const amountRequested = parseFloat(row["amount requested"] || row.amount || "0");
    const interestRate = parseFloat(row["interest rate"] || "0.1");
    const termMonths = parseInt(row["term months"] || row["duration (months)"] || "12", 10);
    const monthlyRepayment = parseFloat(row["monthly repayment"] || "0");

    if (!loanRef || !employeeNo || !Number.isFinite(amountRequested) || amountRequested <= 0) {
      skipped++;
      errors.push(`Row ${rowNo}: reference, employee no, and a positive amount requested are required.`);
      continue;
    }

    if (!Number.isFinite(interestRate) || !Number.isFinite(termMonths) || termMonths <= 0) {
      skipped++;
      errors.push(`Row ${rowNo}: interest rate and term months must be valid positive numbers.`);
      continue;
    }

    const productId = productMap.get(productName);
    if (!productId) {
      skipped++;
      errors.push(`Row ${rowNo}: loan product "${row.product || "Regular Loan"}" was not found.`);
      continue;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", employeeNo)
      .single();

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${employeeNo} was not found.`);
      continue;
    }

    const repayment =
      monthlyRepayment > 0
        ? monthlyRepayment
        : Math.round((amountRequested * (1 + interestRate)) / termMonths);

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: loanRef,
        employee_id: employee.id,
        loan_product_id: productId,
        amount_requested: amountRequested,
        amount_approved: row["amount approved"] ? parseFloat(row["amount approved"]) : null,
        outstanding_balance: row["outstanding balance"]
          ? parseFloat(row["outstanding balance"])
          : amountRequested,
        interest_rate: interestRate,
        term_months: termMonths,
        monthly_repayment: repayment,
        purpose: row.purpose || "",
        status: row.status || "pending",
      },
      { onConflict: "loan_ref" }
    );

    if (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error.message}`);
    } else {
      imported++;
    }
  }

  return { imported, skipped, errors };
}

export function getImportTemplate(type: ImportType): string {
  const templates = {
    employees: [
      ["Employee No", "First Name", "Last Name", "Email", "Department", "Position", "Join Date", "Salary", "Phone"],
      ["EMP-001", "John", "Smith", "john.smith@example.com", "operations", "Analyst", "2024-01-15", "5000", "0240000000"],
    ],
    savings: [
      ["Employee No", "Amount", "Date (YYYY-MM-DD or DD/MM/YYYY)", "Type", "Account Number"],
      ["EMP-001", "500", "01/06/2024", "monthly", ""],
    ],
    loans: [
      ["Reference", "Employee No", "Product", "Amount Requested", "Interest Rate", "Term Months", "Monthly Repayment", "Status", "Purpose"],
      ["LN-001", "EMP-001", "Normal Loan", "10000", "0.02", "12", "850", "pending", "Emergency"],
    ],
  };

  return templates[type].map((row) => row.join(",")).join("\n");
}
