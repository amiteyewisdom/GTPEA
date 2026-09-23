import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { logImportRun } from "@/lib/imports/log-import";
import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to import data." }, { status: 401 });
  }

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to import data." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: "Invalid file type. Please upload an Excel file (.xlsx, .xls)." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    
    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Expected sheet names
    const expectedSheets = ['EmployeeRecordNew', 'SavingsNew', 'QuickCashNew', 'HP New', 'Normal Loans New', 'Lands New'];
    
    // Check if expected sheets exist
    const missingSheets = expectedSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
    if (missingSheets.length > 0) {
      return NextResponse.json({ 
        error: `Missing required sheets: ${missingSheets.join(', ')}`,
        missingSheets 
      }, { status: 400 });
    }

    // Process sheets in order
    const results = {
      employees: { imported: 0, skipped: 0, errors: [] as string[] },
      savings: { imported: 0, skipped: 0, errors: [] as string[] },
      quickCash: { imported: 0, skipped: 0, errors: [] as string[] },
      hirePurchase: { imported: 0, skipped: 0, errors: [] as string[] },
      normalLoans: { imported: 0, skipped: 0, errors: [] as string[] },
      lands: { imported: 0, skipped: 0, errors: [] as string[] }
    };

    // 1. Process Employees (must be first)
    const employeeSheet = workbook.Sheets['EmployeeRecordNew'];
    const employeeCsv = XLSX.utils.sheet_to_csv(employeeSheet);
    const employeeResult = await processGTPEAEmployees(adminSupabase, employeeCsv, user.id);
    results.employees = employeeResult;

    // 2. Process Savings
    const savingsSheet = workbook.Sheets['SavingsNew'];
    const savingsCsv = XLSX.utils.sheet_to_csv(savingsSheet);
    const savingsResult = await processGTPEASavings(adminSupabase, savingsCsv, user.id);
    results.savings = savingsResult;

    // 3. Process Quick Cash
    const quickCashSheet = workbook.Sheets['QuickCashNew'];
    const quickCashCsv = XLSX.utils.sheet_to_csv(quickCashSheet);
    const quickCashResult = await processGTPEAQuickCash(adminSupabase, quickCashCsv, user.id);
    results.quickCash = quickCashResult;

    // 4. Process Hire Purchase
    const hpSheet = workbook.Sheets['HP New'];
    const hpCsv = XLSX.utils.sheet_to_csv(hpSheet);
    const hpResult = await processGTPEAHirePurchase(adminSupabase, hpCsv, user.id);
    results.hirePurchase = hpResult;

    // 5. Process Normal Loans
    const normalLoansSheet = workbook.Sheets['Normal Loans New'];
    const normalLoansCsv = XLSX.utils.sheet_to_csv(normalLoansSheet);
    const normalLoansResult = await processGTPEANormalLoans(adminSupabase, normalLoansCsv, user.id);
    results.normalLoans = normalLoansResult;

    // 6. Process Lands
    const landsSheet = workbook.Sheets['Lands New'];
    const landsCsv = XLSX.utils.sheet_to_csv(landsSheet);
    const landsResult = await processGTPEALands(adminSupabase, landsCsv, user.id);
    results.lands = landsResult;

    // Log the import
    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);
    const allErrors = Object.values(results).flatMap(r => r.errors);

    await logImportRun(adminSupabase, user.id, 'master_excel_upload', file.name, {
      imported: totalImported,
      skipped: totalSkipped,
      errors: allErrors
    });

    return NextResponse.json({
      message: "Master import completed successfully.",
      results,
      summary: {
        totalImported,
        totalSkipped,
        totalErrors: allErrors.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed." },
      { status: 500 }
    );
  }
}

// Helper functions for processing each sheet type
async function processGTPEAEmployees(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
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

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "-";

    const { error } = await supabase.from("employees").upsert(
      {
        employee_no: staffId,
        first_name: firstName,
        last_name: lastName,
        email: `${staffId.toLowerCase()}@staff.gtpea.local`,
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

async function processGTPEASavings(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const staffSavingAccountNumber = row["staffsavingaccountnumber"] || row["StaffSavingAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

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
        type: "savings",
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

async function processGTPEAQuickCash(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const staffQuickCashAccountNumber = row["staffquickcashaccountnumber"] || row["StaffQuickCashAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

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
        type: "quick_cash",
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

async function processGTPEAHirePurchase(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
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

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `HP-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: 1,
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

async function processGTPEANormalLoans(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
    const nlAccountNumber = row["nlaccountnumber"] || row["NLAccountNumber"];
    const facilityAccountNumber = row["facilityaccountnumber"] || row["FacilityAccountNumber"];
    const balance = parseFloat(row["balance"] || row["Balance"] || "0");
    const reference = row["reference"] || row["Reference"];

    if (!staffId || !Number.isFinite(balance)) {
      skipped++;
      errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
      continue;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `NL-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: 2,
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

async function processGTPEALands(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const staffId = row["staffid"] || row["StaffID"];
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

    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("employee_no", staffId)
      .single();

    if (!employee) {
      skipped++;
      errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
      continue;
    }

    const { error } = await supabase.from("loans").upsert(
      {
        loan_ref: `LAND-${staffId}-${Date.now()}`,
        employee_id: employee.id,
        loan_product_id: 3,
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

// CSV parsing helper
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v.trim())) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeDepartment(input: string): string {
  const raw = input.trim().toLowerCase().replace(/[&\/_-]/g, " ");
  const validDepartments = ["management", "finance", "operations", "hr", "it", "sales", "legal", "audit", "retail", "marketing", "supply chain", "wholesale"];
  
  if (validDepartments.includes(raw)) return raw;
  
  const aliases: Record<string, string[]> = {
    management: ["management", "mgt", "mgr", "managerial"],
    finance: ["finance", "fin", "account", "accounts", "accounting", "bac"],
    operations: ["operations", "ops", "operational", "procurement", "warehouse", "logistics", "admin", "administration", "support", "general services", "gs"],
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

  for (const [department, departmentAliases] of Object.entries(aliases)) {
    if (departmentAliases.includes(raw)) return department;
  }

  return "operations";
}