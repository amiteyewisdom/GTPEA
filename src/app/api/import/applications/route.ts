import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Check if user is fund manager or admin
  const profileRes = await (supabase.from("profiles").select("role").eq("user_id", user.id).single() as any);
  const role = profileRes.data?.role ?? "employee";

  if (!["fund_manager", "super_admin", "administrator", "chairperson"].includes(role)) {
    return NextResponse.json({ error: "Forbidden. Only fund managers and admins can import applications." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // loans, withdrawals, or all

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "Invalid CSV file." }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    let importedCount = 0;
    let errors: string[] = [];

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        if (type === "loans" || type === "all") {
          if (headers.includes("reference") && headers.includes("amount requested")) {
            // Import loan
            const { data: employee } = await (supabase
              .from("employees")
              .select("id")
              .eq("employee_no", row["employee no"])
              .single() as any);

            if (employee) {
              const { error: loanError } = await (supabase.from("loans").insert([{
                employee_id: employee.id,
                loan_ref: row.reference,
                amount_requested: parseFloat(row["amount requested"]),
                amount_approved: row["amount approved"] ? parseFloat(row["amount approved"]) : null,
                interest_rate: parseFloat(row["interest rate"]),
                term_months: parseInt(row["term (months)"]),
                monthly_repayment: parseFloat(row["monthly repayment"]),
                purpose: row.purpose || "",
                status: row.status || "pending",
                created_at: row["created at"] || new Date().toISOString(),
              }] as any) as any);

              if (!loanError) {
                importedCount++;
              } else {
                errors.push(`Row ${i + 1}: ${loanError.message}`);
              }
            }
          }
        }

        if (type === "withdrawals" || type === "all") {
          if (headers.includes("reference") && headers.includes("amount")) {
            // Import withdrawal
            const { data: employee } = await (supabase
              .from("employees")
              .select("id")
              .eq("employee_no", row["employee no"])
              .single() as any);

            if (employee) {
              const { data: savings } = await (supabase
                .from("savings")
                .select("id")
                .eq("account_number", row["account number"])
                .eq("employee_id", employee.id)
                .single() as any);

              if (savings) {
                const { error: withdrawalError } = await (supabase.from("withdrawal_requests").insert([{
                  employee_id: employee.id,
                  savings_id: savings.id,
                  request_ref: row.reference,
                  amount: parseFloat(row.amount),
                  reason: row.reason || "",
                  status: row.status || "pending",
                  requested_at: row["requested at"] || new Date().toISOString(),
                }] as any) as any);

                if (!withdrawalError) {
                  importedCount++;
                } else {
                  errors.push(`Row ${i + 1}: ${withdrawalError.message}`);
                }
              }
            }
          }
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Failed to parse`);
      }
    }

    return NextResponse.json({
      message: "Import completed",
      imported: importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Import failed: " + (error as Error).message }, { status: 500 });
  }
}
