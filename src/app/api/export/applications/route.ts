import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all"; // all, loans, withdrawals

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
    return NextResponse.json({ error: "Forbidden. Only fund managers and admins can export applications." }, { status: 403 });
  }

  let csvContent = "";
  let filename = "";

  if (type === "all" || type === "loans") {
    const { data: loans } = await supabase
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
        created_at,
        disbursement_date,
        expected_completion_date,
        employees (first_name, last_name, employee_no),
        loan_products (name)
      `)
      .order("created_at", { ascending: false });

    if (loans && loans.length > 0) {
      csvContent += "LOAN APPLICATIONS\n";
      csvContent += "Reference,Employee,Employee No,Product,Amount Requested,Amount Approved,Amount Disbursed,Outstanding Balance,Interest Rate,Term (months),Monthly Repayment,Status,Purpose,Created At,Disbursement Date,Expected Completion\n";
      
      for (const loan of loans as any[]) {
        const employee = loan.employees ? `${loan.employees.first_name} ${loan.employees.last_name}` : "N/A";
        const employeeNo = loan.employees?.employee_no || "N/A";
        const product = loan.loan_products?.name || "N/A";
        
        csvContent += `${loan.loan_ref},"${employee}",${employeeNo},"${product}",${loan.amount_requested},${loan.amount_approved || 0},${loan.amount_disbursed || 0},${loan.outstanding_balance},${loan.interest_rate},${loan.term_months},${loan.monthly_repayment},${loan.status},"${loan.purpose || ''}",${loan.created_at},${loan.disbursement_date || ''},${loan.expected_completion_date || ''}\n`;
      }
      
      csvContent += "\n";
    }
  }

  if (type === "all" || type === "withdrawals") {
    const { data: withdrawals } = await supabase
      .from("withdrawal_requests")
      .select(`
        request_ref,
        amount,
        reason,
        status,
        requested_at,
        disbursement_date,
        employees (first_name, last_name, employee_no),
        savings (account_number, type)
      `)
      .order("requested_at", { ascending: false });

    if (withdrawals && withdrawals.length > 0) {
      csvContent += "WITHDRAWAL REQUESTS\n";
      csvContent += "Reference,Employee,Employee No,Account Number,Account Type,Amount,Reason,Status,Requested At,Disbursement Date\n";
      
      for (const withdrawal of withdrawals as any[]) {
        const employee = withdrawal.employees ? `${withdrawal.employees.first_name} ${withdrawal.employees.last_name}` : "N/A";
        const employeeNo = withdrawal.employees?.employee_no || "N/A";
        const accountNumber = withdrawal.savings?.account_number || "N/A";
        const accountType = withdrawal.savings?.type || "N/A";
        
        csvContent += `${withdrawal.request_ref},"${employee}",${employeeNo},${accountNumber},"${accountType}",${withdrawal.amount},"${withdrawal.reason || ''}",${withdrawal.status},${withdrawal.requested_at},${withdrawal.disbursement_date || ''}\n`;
      }
    }
  }

  if (!csvContent) {
    return NextResponse.json({ error: "No data found for export." }, { status: 404 });
  }

  const timestamp = new Date().toISOString().split("T")[0];
  filename = `gtpea_applications_export_${type}_${timestamp}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
