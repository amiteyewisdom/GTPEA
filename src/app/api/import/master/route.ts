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
    console.log('[Master] Sheets found:', workbook.SheetNames);
    console.log('[Master] Missing sheets:', missingSheets);
    if (missingSheets.length > 0) {
      return NextResponse.json({ 
        error: `Missing required sheets: ${missingSheets.join(', ')}`,
        missingSheets 
      }, { status: 400 });
    }

    // Process sheets in order with batch processing to avoid timeout
    const results = {
      employees: { imported: 0, skipped: 0, errors: [] as string[] },
      savings: { imported: 0, skipped: 0, errors: [] as string[] },
      quickCash: { imported: 0, skipped: 0, errors: [] as string[] },
      hirePurchase: { imported: 0, skipped: 0, errors: [] as string[] },
      normalLoans: { imported: 0, skipped: 0, errors: [] as string[] },
      lands: { imported: 0, skipped: 0, errors: [] as string[] }
    };

    // 1. Process Employees (must be first)
    console.log('[MASTER ROUTE] === STARTING EMPLOYEE PROCESSING ===');
    const employeeSheet = workbook.Sheets['EmployeeRecordNew'];
    const employeeCsv = XLSX.utils.sheet_to_csv(employeeSheet);
    const employeeResult = await processGTPEAEmployees(adminSupabase, employeeCsv, user.id);
    results.employees = employeeResult;
    console.log('[MASTER ROUTE] === EMPLOYEE PROCESSING COMPLETED ===');
    console.log('[MASTER ROUTE] About to start Savings processing at:', new Date().toISOString());

    // 2. Process Savings
    try {
      const savingsSheet = workbook.Sheets['SavingsNew'];
      if (!savingsSheet) {
        console.error('[Master] SavingsNew sheet not found');
        results.savings = { imported: 0, skipped: 0, errors: ['SavingsNew sheet not found in Excel file'] };
      } else {
        const savingsCsv = XLSX.utils.sheet_to_csv(savingsSheet);
        console.log('[Master] Starting Savings processing...');
        const savingsResult = await processGTPEASavings(adminSupabase, savingsCsv, user.id);
        results.savings = savingsResult;
        console.log('[Master] Savings completed:', savingsResult);
      }
    } catch (error) {
      console.error('[Master] Savings processing error:', error);
      results.savings = { imported: 0, skipped: 0, errors: [`Savings processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
    }

    // 3. Process Quick Cash
    try {
      const quickCashSheet = workbook.Sheets['QuickCashNew'];
      if (!quickCashSheet) {
        console.error('[Master] QuickCashNew sheet not found');
        results.quickCash = { imported: 0, skipped: 0, errors: ['QuickCashNew sheet not found in Excel file'] };
      } else {
        const quickCashCsv = XLSX.utils.sheet_to_csv(quickCashSheet);
        console.log('[Master] Starting Quick Cash processing...');
        const quickCashResult = await processGTPEAQuickCash(adminSupabase, quickCashCsv, user.id);
        results.quickCash = quickCashResult;
        console.log('[Master] Quick Cash completed:', quickCashResult);
      }
    } catch (error) {
      console.error('[Master] Quick Cash processing error:', error);
      results.quickCash = { imported: 0, skipped: 0, errors: [`Quick Cash processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
    }

    // 4. Process Hire Purchase
    try {
      const hpSheet = workbook.Sheets['HP New'];
      if (!hpSheet) {
        console.error('[Master] HP New sheet not found');
        results.hirePurchase = { imported: 0, skipped: 0, errors: ['HP New sheet not found in Excel file'] };
      } else {
        const hpCsv = XLSX.utils.sheet_to_csv(hpSheet);
        console.log('[Master] Starting Hire Purchase processing...');
        const hpResult = await processGTPEAHirePurchase(adminSupabase, hpCsv, user.id);
        results.hirePurchase = hpResult;
        console.log('[Master] Hire Purchase completed:', hpResult);
      }
    } catch (error) {
      console.error('[Master] Hire Purchase processing error:', error);
      results.hirePurchase = { imported: 0, skipped: 0, errors: [`Hire Purchase processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
    }

    // 5. Process Normal Loans
    try {
      const normalLoansSheet = workbook.Sheets['Normal Loans New'];
      if (!normalLoansSheet) {
        console.error('[Master] Normal Loans New sheet not found');
        results.normalLoans = { imported: 0, skipped: 0, errors: ['Normal Loans New sheet not found in Excel file'] };
      } else {
        const normalLoansCsv = XLSX.utils.sheet_to_csv(normalLoansSheet);
        console.log('[Master] Starting Normal Loans processing...');
        const normalLoansResult = await processGTPEANormalLoans(adminSupabase, normalLoansCsv, user.id);
        results.normalLoans = normalLoansResult;
        console.log('[Master] Normal Loans completed:', normalLoansResult);
      }
    } catch (error) {
      console.error('[Master] Normal Loans processing error:', error);
      results.normalLoans = { imported: 0, skipped: 0, errors: [`Normal Loans processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
    }

    // 6. Process Lands
    try {
      const landsSheet = workbook.Sheets['Lands New'];
      if (!landsSheet) {
        console.error('[Master] Lands New sheet not found');
        results.lands = { imported: 0, skipped: 0, errors: ['Lands New sheet not found in Excel file'] };
      } else {
        const landsCsv = XLSX.utils.sheet_to_csv(landsSheet);
        console.log('[Master] Starting Lands processing...');
        const landsResult = await processGTPEALands(adminSupabase, landsCsv, user.id);
        results.lands = landsResult;
        console.log('[Master] Lands completed:', landsResult);
      }
    } catch (error) {
      console.error('[Master] Lands processing error:', error);
      results.lands = { imported: 0, skipped: 0, errors: [`Lands processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
    }
    */

    // Log the import
    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);
    const allErrors = Object.values(results).flatMap(r => r.errors);

    await logImportRun(adminSupabase, user.id, 'master_excel_upload' as any, file.name, {
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
    console.error('[Master Import Error]', error);
    const errorMessage = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json(
      { error: errorMessage },
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

  console.log('[Employees] Processing', rows.length, 'rows');
  console.log('[Employees] Function started at:', new Date().toISOString());

  try {
    // Process in batches to improve performance
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      console.log(`[Employees] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(rows.length/batchSize)}`);
      const batch = rows.slice(i, i + batchSize);
      const batchPromises = batch.map(async (row, batchIndex) => {
        const rowNo = i + batchIndex + 2;

        const staffId = (row["staffid"] || row["StaffID"])?.trim();
        const fullName = row["fullname"] || row["FullName"];
        const department = row["department"] || row["Department"] || "operations";
        const staffAccountNumber = row["staffaccountnumber"] || row["StaffAccountNumber"];
        const phoneNumber = row["phonenumber"] || row["PhoneNumber"];

        if (!staffId || !fullName) {
          return { skipped: true, error: `Row ${rowNo}: missing StaffID or FullName.` };
        }

        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "-";

        // Create or update employee record
        const { error: employeeError } = await supabase.from("employees").upsert(
          {
            employee_no: staffId,
            first_name: firstName,
            last_name: lastName,
            email: `${staffId.toLowerCase()}@staff.gtpea.local`,
            phone_number: phoneNumber || null,
            department,
            position: "Staff",
            bank_account_no: staffAccountNumber || null,
            date_joined: new Date().toISOString().slice(0, 10),
            salary: 0,
            status: "active",
            created_by: userId,
            password_changed_at: null, // Force password change on first login
          },
          { onConflict: "employee_no" }
        );

        if (employeeError) {
          return { skipped: true, error: `Row ${rowNo}: Employee record error: ${employeeError.message}` };
        }

        // Auth account creation removed to avoid timeout - employees will be created on first login
        // The login flow handles creating auth accounts automatically

        if (employeeError) {
          return { skipped: true, error: `Row ${rowNo}: ${employeeError.message}` };
        }
        return { imported: true };
      });

      const results = await Promise.all(batchPromises);
      results.forEach(result => {
        if (result.imported) imported++;
        if (result.skipped) {
          skipped++;
          if (result.error) errors.push(result.error);
        }
      });
    }
  } catch (error) {
    console.error('[Employees] Processing error:', error);
    errors.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('[Employees] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[Employees] Sample errors:', errors.slice(0, 5));
  }
  console.log('[Employees] Process finished, returning result at:', new Date().toISOString());
  return { imported, skipped, errors };
}

async function processGTPEASavings(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log('[Savings] Total rows to process:', rows.length);
  
  // Debug: Show sample employee numbers from database
  const { data: sampleEmployees } = await supabase
    .from("employees")
    .select("employee_no")
    .limit(5);
  console.log('[Savings] Sample employee_no from DB:', sampleEmployees?.map((e: any) => e.employee_no));

  // Simplified: process one by one for better error handling
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    try {
      const staffId = (row["staffid"] || row["StaffID"])?.trim();
      const staffSavingAccountNumber = row["staffsavingaccountnumber"] || row["StaffSavingAccountNumber"];
      const balance = parseFloat(row["balance"] || row["Balance"] || "0");
      const reference = row["reference"] || row["Reference"];

      if (!staffId || !Number.isFinite(balance)) {
        skipped++;
        errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
        continue;
      }

      // Try both formats for staff ID lookup
      const altId = staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId;
      console.log(`[Savings] Looking up employee ${staffId} (alt: ${altId})`);
      
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .or(`employee_no.eq.${staffId},employee_no.eq.${altId}`)
        .single();

      if (!employee) {
        console.log(`[Savings] Employee ${staffId} not found (tried: ${staffId}, ${altId})`);
        skipped++;
        errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
        continue;
      }
      
      console.log(`[Savings] Found employee ${staffId}`);

      const { error } = await supabase.from("savings").upsert(
        {
          employee_id: employee.id,
          account_number: staffSavingAccountNumber || `SAV-${staffId}`,
          balance: balance,
          type: "regular", // Use valid enum value instead of 'savings'
          notes: reference || "Savings",
        },
        { onConflict: "account_number" }
      );

      if (error) {
        skipped++;
        errors.push(`Row ${rowNo}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('[Savings] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[Savings] Sample errors:', errors.slice(0, 5));
  }
  return { imported, skipped, errors };
}

async function processGTPEAQuickCash(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log('[QuickCash] Total rows to process:', rows.length);

  // Simplified: process one by one for better error handling
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    try {
      const staffId = (row["staffid"] || row["StaffID"])?.trim();
      const staffQuickCashAccountNumber = row["staffquickcashaccountnumber"] || row["StaffQuickCashAccountNumber"];
      const balance = parseFloat(row["balance"] || row["Balance"] || "0");
      const reference = row["reference"] || row["Reference"];

      if (!staffId || !Number.isFinite(balance)) {
        skipped++;
        errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
        continue;
      }

      // Try both formats for staff ID lookup
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .or(`employee_no.eq.${staffId},employee_no.eq.${staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId}`)
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
          type: "special", // Use valid enum value instead of 'quick_cash'
          notes: reference || "Quick-Cash",
        },
        { onConflict: "account_number" }
      );

      if (error) {
        skipped++;
        errors.push(`Row ${rowNo}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('[QuickCash] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[QuickCash] Sample errors:', errors.slice(0, 5));
  }
  return { imported, skipped, errors };
}

async function processGTPEAHirePurchase(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log('[HirePurchase] Total rows to process:', rows.length);

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

  // Simplified: process one by one for better error handling
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    try {
      const staffId = (row["staffid"] || row["StaffID"])?.trim();
      const balance = parseFloat(row["balance"] || row["Balance"] || "0");
      const itemDescription = row["item description"] || row["Item Description"];

      if (!staffId || !Number.isFinite(balance)) {
        skipped++;
        errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
        continue;
      }

      // Try both formats for staff ID lookup
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .or(`employee_no.eq.${staffId},employee_no.eq.${staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId}`)
        .single();

      if (!employee) {
        skipped++;
        errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
        continue;
      }

      const { error } = await supabase.from("loans").upsert(
        {
          loan_ref: `HP-${staffId}-${Date.now()}-${rowNo}`,
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
        },
        { onConflict: "loan_ref" }
      );

      if (error) {
        skipped++;
        errors.push(`Row ${rowNo}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('[HirePurchase] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[HirePurchase] Sample errors:', errors.slice(0, 5));
  }
  return { imported, skipped, errors };
}

async function processGTPEANormalLoans(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log('[NormalLoans] Total rows to process:', rows.length);

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

  // Simplified: process one by one for better error handling
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    try {
      const staffId = (row["staffid"] || row["StaffID"])?.trim();
      const balance = parseFloat(row["balance"] || row["Balance"] || "0");

      if (!staffId || !Number.isFinite(balance)) {
        skipped++;
        errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
        continue;
      }

      // Try both formats for staff ID lookup
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .or(`employee_no.eq.${staffId},employee_no.eq.${staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId}`)
        .single();

      if (!employee) {
        skipped++;
        errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
        continue;
      }

      const { error } = await supabase.from("loans").upsert(
        {
          loan_ref: `NL-${staffId}-${Date.now()}-${rowNo}`,
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
        },
        { onConflict: "loan_ref" }
      );

      if (error) {
        skipped++;
        errors.push(`Row ${rowNo}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('[NormalLoans] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[NormalLoans] Sample errors:', errors.slice(0, 5));
  }
  return { imported, skipped, errors };
}

async function processGTPEALands(supabase: any, csv: string, userId: string) {
  const rows = parseCsv(csv);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log('[Lands] Total rows to process:', rows.length);

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

  // Simplified: process one by one for better error handling
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    try {
      const staffId = (row["staffid"] || row["StaffID"])?.trim();
      const balance = parseFloat(row["balance"] || row["Balance"] || "0");
      const item = row["item"] || row["Item"];

      if (!staffId || !Number.isFinite(balance)) {
        skipped++;
        errors.push(`Row ${rowNo}: missing StaffID or invalid Balance.`);
        continue;
      }

      // Try both formats for staff ID lookup
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .or(`employee_no.eq.${staffId},employee_no.eq.${staffId.startsWith('P') ? staffId.substring(1) : 'P' + staffId}`)
        .single();

      if (!employee) {
        skipped++;
        errors.push(`Row ${rowNo}: employee ${staffId} was not found.`);
        continue;
      }

      const { error } = await supabase.from("loans").upsert(
        {
          loan_ref: `LAND-${staffId}-${Date.now()}-${rowNo}`,
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
        },
        { onConflict: "loan_ref" }
      );

      if (error) {
        skipped++;
        errors.push(`Row ${rowNo}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${rowNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('[Lands] Completed:', imported, 'imported,', skipped, 'skipped');
  if (errors.length > 0) {
    console.log('[Lands] Sample errors:', errors.slice(0, 5));
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
  
  // Direct match first
  if (validDepartments.includes(raw)) return raw;
  
  const aliases: Record<string, string[]> = {
    management: ["management", "mgt", "mgr", "managerial"],
    finance: ["finance", "fin", "account", "accounts", "accounting", "bac"],
    operations: ["operations", "ops", "operational", "procurement", "warehouse", "logistics", "admin", "administration", "support", "general services", "gs"],
    hr: ["hr", "human resources", "human resource", "personnel"],
    it: ["it", "information technology", "information tech", "tech", "technology", "engineering"],
    sales: ["sales", "business development", "biz dev"],
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

  // Default to operations for unknown departments
  console.log(`[Department] Unknown department "${input}" defaulting to operations`);
  return "operations";
}