import { parseCsv } from "@/lib/csv";
import type { AppSupabase } from "@/lib/supabase/types";

export type ImportType = "gtpea-employees" | "gtpea-savings" | "gtpea-quick-cash" | "gtpea-hire-purchase" | "gtpea-normal-loans" | "gtpea-lands" | "master_excel_upload" | string;

const VALID_DEPARTMENTS = ["management", "finance", "operations", "hr", "it", "sales", "legal", "audit", "retail", "marketing", "supply chain", "wholesale"] as const;

type Department = (typeof VALID_DEPARTMENTS)[number];

function normalizeDepartment(input: string): Department {
  const raw = input.trim().toLowerCase().replace(/[&\/_-]/g, " ");

  const aliases: Record<string, string[]> = {
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
    retail: ["retail", "retail sales"],
    marketing: ["marketing", "market", "promotions"],
    "supply chain": ["supply chain", "supply", "logistics", "procurement"],
    wholesale: ["wholesale", "wholesale sales"],
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
    case "gtpea-employees":
      return importGTPEAEmployees(supabase, rows, userId);
    case "gtpea-savings":
      return importGTPEASavings(supabase, rows, userId);
    case "gtpea-quick-cash":
      return importGTPEAQuickCash(supabase, rows, userId);
    case "gtpea-hire-purchase":
      return importGTPEAHirePurchase(supabase, rows, userId);
    case "gtpea-normal-loans":
      return importGTPEANormalLoans(supabase, rows, userId);
    case "gtpea-lands":
      return importGTPEALands(supabase, rows, userId);
    default:
      return { imported: 0, skipped: 0, errors: ["Unknown import type."] };
  }
}

// GTPEA-specific import functions
async function importGTPEAEmployees(
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

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const department = normalizeDepartment(row["department"] || row["Department"] || "operations");
    const staffAccountNumber = row["staffaccountnumber"] || row["StaffAccountNumber"];
    const phoneNumber = row["phonenumber"] || row["PhoneNumber"];

    if (!staffId || !fullName) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or FullName.`);
      continue;
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "-";

    const { error } = await supabase.from("employees").upsert(
      {
        employee_no: staffId,
        first_name: firstName,
        last_name: lastName,
        email: `${staffId.toLowerCase()}@staff.gtpea.local`, // Internal email for Supabase auth
        phone: phoneNumber || null,
        department,
        position: "Staff",
        bank_account_no: staffAccountNumber || null,
        date_joined: new Date().toISOString().slice(0, 10),
        salary: 0,
        status: "active",
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

async function importGTPEASavings(
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

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const staffSavingAccountNumber = row["staffsavingaccountnumber"] || row["StaffSavingAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    // Try to find employee by exact staff ID first
    let { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    // If not found, try with/without "P" prefix
    if (!employee) {
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      const { data: altEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("employee_no", altId)
        .single();
      employee = altEmployee;
    }

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("savings").upsert(
      {
        employee_id: employee.id,
        account_number: staffSavingAccountNumber || `SAV-${staffId}`,
        balance: balance,
        type: "regular",
        facility_account: facilityAccountNumber || null,
        reference: reference || "Savings",
        created_by: userId,
      },
      { onConflict: "account_number" }
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

async function importGTPEAQuickCash(
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

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const staffQuickCashAccountNumber = row["staffquickcashaccountnumber"] || row["StaffQuickCashAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    // Try to find employee by exact staff ID first
    let { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    // If not found, try with/without "P" prefix
    if (!employee) {
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      const { data: altEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("employee_no", altId)
        .single();
      employee = altEmployee;
    }

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("savings").upsert(
      {
        employee_id: employee.id,
        account_number: staffQuickCashAccountNumber || `QC-${staffId}`,
        balance: balance,
        type: "special",
        facility_account: facilityAccountNumber || null,
        reference: reference || "Quick-Cash",
        created_by: userId,
      },
      { onConflict: "account_number" }
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

async function importGTPEAHirePurchase(
  supabase: AppSupabase,
  rows: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Fetch loan product ID for Hire Purchase
  const { data: hpProduct } = await supabase
    .from("loan_products")
    .select("id")
    .eq("name", "Hire Purchase")
    .single();
  
  const hpProductId = hpProduct?.id;
  if (!hpProductId) {
    return { imported: 0, skipped: rows.length, errors: ["Hire Purchase loan product not found in database"] };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const savingsAccountNumber = row["savingsaccountnumber"] || row["SavingsAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];
    const itemDescription = row["item description"] || row["Item Description"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    // Try to find employee by exact staff ID first
    let { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    // If not found, try with/without "P" prefix
    if (!employee) {
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      const { data: altEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("employee_no", altId)
        .single();
      employee = altEmployee;
    }

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `HP-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: hpProductId,
        amount_requested: balance,
        amount_approved: balance,
        outstanding_balance: balance,
        interest_rate: 0.02,
        term_months: 12,
        monthly_repayment: balance / 12,
        purpose: itemDescription || "Hire Purchase",
        status: "active",
        created_by: userId,
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

async function importGTPEANormalLoans(
  supabase: AppSupabase,
  rows: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Fetch loan product ID for Normal Loan
  const { data: nlProduct } = await supabase
    .from("loan_products")
    .select("id")
    .eq("name", "Normal Loan")
    .single();
  
  const nlProductId = nlProduct?.id;
  if (!nlProductId) {
    return { imported: 0, skipped: rows.length, errors: ["Normal Loan product not found in database"] };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const nlAccountNumber = row["nlaccountnumber"] || row["NLAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    // Try to find employee by exact staff ID first
    let { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    // If not found, try with/without "P" prefix
    if (!employee) {
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      const { data: altEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("employee_no", altId)
        .single();
      employee = altEmployee;
    }

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `NL-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: nlProductId,
        amount_requested: balance,
        amount_approved: balance,
        outstanding_balance: balance,
        interest_rate: 0.02,
        term_months: 12,
        monthly_repayment: balance / 12,
        purpose: "Normal Loan",
        status: "active",
        created_by: userId,
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

async function importGTPEALands(
  supabase: AppSupabase,
  rows: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Fetch loan product ID for Land Loan
  const { data: landProduct } = await supabase
    .from("loan_products")
    .select("id")
    .eq("name", "Land Loan")
    .single();
  
  const landProductId = landProduct?.id;
  if (!landProductId) {
    return { imported: 0, skipped: rows.length, errors: ["Land Loan product not found in database"] };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const fullName = row["fullname"] || row["FullName"];
    const savingsAccountNumber = row["savingsaccountnumber"] || row["SavingsAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];
    const item = row["item"] || row["Item"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    // Try to find employee by exact staff ID first
    let { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    // If not found, try with/without "P" prefix
    if (!employee) {
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      const { data: altEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("employee_no", altId)
        .single();
      employee = altEmployee;
    }

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `LAND-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: landProductId,
        amount_requested: balance,
        amount_approved: balance,
        outstanding_balance: balance,
        interest_rate: 0.02,
        term_months: 24,
        monthly_repayment: balance / 24,
        purpose: item || "Land Purchase",
        status: "active",
        created_by: userId,
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
  const templates: Record<string, string[][]> = {
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
    "gtpea-employees": [
      ["StaffID", "FullName", "Department", "StaffAccountNumber", "PhoneNumber"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "Retail", "P0770", "0240000000"],
    ],
    "gtpea-savings": [
      ["StaffID", "FullName", "StaffSavingAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "63101001P0770", "63101001", "21100", "Savings"],
    ],
    "gtpea-quick-cash": [
      ["StaffID", "FullName", "StaffQuickCashAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0821", "Benjamin Kissi", "62131001P0821", "62131001", "510", "Quick-Cash"],
    ],
    "gtpea-hire-purchase": [
      ["StaffID", "FullName", "SavingsAccountNumber", "FacilityAccountNumber", "Balance", "Reference", "Item Description"],
      ["0767", "Franklina Ohene-Mensah", "621210010767", "62121001", "2967.25", "Hire Purchase", "SAMSUNG A56+HEAD - 128GB"],
    ],
    "gtpea-normal-loans": [
      ["StaffID", "FullName", "NLAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0774", "ANSAH ESINAM PHYLLIS", "62101001P0774", "62101001", "11343.14", "Normal Loan"],
    ],
    "gtpea-lands": [
      ["StaffID", "FullName", "SavingsAccountNumber", "FacilityAccountNumber", "Balance", "Reference", "Item"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "62141001P0770", "62141001", "31642.96", "Lands", "Kopodor Land"],
    ],
    "master_excel_upload": [
      ["Note", "Use the GTPEA Final Template New.xlsx file for master upload"],
      ["This", "contains all sheets: EmployeeRecordNew, SavingsNew, QuickCashNew, HP New, Normal Loans New, Lands New"],
    ],
  };

  return templates[type].map((row: string[]) => row.join(",")).join("\n");
}
