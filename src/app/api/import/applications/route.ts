import { NextResponse } from "next/server";
import { canImport, getStaffUser } from "@/lib/api/staff-auth";
import { parseCsv } from "@/lib/csv";
import { logImportRun } from "@/lib/imports/log-import";
import { normalizeLoanProductName } from "@/lib/imports/process-import";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to import data." }, { status: 401 });
  }

  if (!canImport(role)) {
    return NextResponse.json({ error: "You do not have permission to import applications." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "all";

    if (!file) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const rows = parseCsv(await file.text());
    if (rows.length === 0) {
      return NextResponse.json({ error: "The CSV file has no data rows." }, { status: 400 });
    }

    const { data: products } = await (adminSupabase.from("loan_products").select("id, name") as any);
    const productMap = new Map((products ?? []).map((item: any) => [item.name.toLowerCase(), item.id]));

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNo = i + 2;

      if ((type === "loans" || type === "all") && row.reference && row["amount requested"]) {
        const employeeNo = row["employee no"];
        const productName = normalizeLoanProductName(row.product || "Normal Loan");
        const productId = productMap.get(productName);

        const { data: employee } = await (adminSupabase
          .from("employees")
          .select("id")
          .eq("employee_no", employeeNo)
          .single() as any);

        if (!employee) {
          errors.push(`Row ${rowNo}: employee ${employeeNo} was not found.`);
          continue;
        }

        if (!productId) {
          errors.push(`Row ${rowNo}: loan product was not found.`);
          continue;
        }

        const amountRequested = parseFloat(row["amount requested"]);
        const termMonths = parseInt(row["term (months)"] || row["term months"] || "12", 10);
        const interestRate = parseFloat(row["interest rate"] || "0.1");
        const monthlyRepayment = parseFloat(row["monthly repayment"] || "0");

        const { error } = await ((adminSupabase as any).from("loans").upsert(
          {
            loan_ref: row.reference,
            employee_id: employee.id,
            loan_product_id: productId,
            amount_requested: amountRequested,
            amount_approved: row["amount approved"] ? parseFloat(row["amount approved"]) : null,
            outstanding_balance: row["outstanding balance"]
              ? parseFloat(row["outstanding balance"])
              : amountRequested,
            interest_rate: interestRate,
            term_months: termMonths,
            monthly_repayment:
              monthlyRepayment > 0
                ? monthlyRepayment
                : Math.round((amountRequested * (1 + interestRate)) / termMonths),
            purpose: row.purpose || "",
            status: row.status || "pending",
          },
          { onConflict: "loan_ref" }
        ) as any);

        if (error) errors.push(`Row ${rowNo}: ${error.message}`);
        else imported++;
      }

      if ((type === "withdrawals" || type === "all") && row.reference && row.amount && row["account number"]) {
        const { data: employee } = await (adminSupabase
          .from("employees")
          .select("id")
          .eq("employee_no", row["employee no"])
          .single() as any);

        if (!employee) {
          errors.push(`Row ${rowNo}: employee was not found.`);
          continue;
        }

        const { data: savings } = await (adminSupabase
          .from("savings")
          .select("id")
          .eq("account_number", row["account number"])
          .eq("employee_id", employee.id)
          .single() as any);

        if (!savings) {
          errors.push(`Row ${rowNo}: savings account was not found.`);
          continue;
        }

        const { error } = await ((adminSupabase as any).from("withdrawal_requests").upsert(
          {
            request_ref: row.reference,
            employee_id: employee.id,
            savings_id: savings.id,
            amount: parseFloat(row.amount),
            reason: row.reason || "",
            status: row.status || "pending",
            requested_at: row["requested at"] || new Date().toISOString(),
          },
          { onConflict: "request_ref" }
        ) as any);

        if (error) errors.push(`Row ${rowNo}: ${error.message}`);
        else imported++;
      }
    }

    const importType = type === "withdrawals" ? "savings" : "loans";
    const result = { imported, skipped: errors.length, errors };
    await logImportRun(adminSupabase, user.id, importType, file.name, result);

    return NextResponse.json({
      message: "Import finished.",
      imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed." },
      { status: 500 }
    );
  }
}
