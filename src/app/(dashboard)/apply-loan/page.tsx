import { createClient } from "@/lib/supabase/server";
import { LoanApplication } from "@/features/loans/LoanApplication";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Apply for a Facility" };

export default async function ApplyLoanPage() {
  const supabase = await createClient();

  const employee = await getLoggedInEmployee(supabase);

  if (!employee || employee.role !== "employee") {
    redirect("/dashboard");
  }

  const [loanProductsRes, employeeDetailsRes, guarantorEmployeesRes] = await Promise.all([
    supabase
      .from("loan_products")
      .select("id, name, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, description, requires_guarantor")
      .eq("is_active", true),
    supabase
      .from("employees")
      .select("first_name, last_name, employee_no, department, date_joined, savings(account_number)")
      .eq("id", employee!.employeeId)
      .single(),
    supabase
      .from("employees")
      .select("id, first_name, last_name, employee_no, savings(account_number)")
      .eq("status", "active")
      .eq("guarantor_status", "approved")
      .order("first_name"),
  ]);

  let savingsBalance = 0;
  let activeLoanBalance = 0;

  if (employee?.employeeId) {
    const [savingsRes, loansRes] = await Promise.all([
      supabase.from("savings").select("balance").eq("employee_id", employee.employeeId).eq("status", "active"),
      supabase.from("loans").select("outstanding_balance").eq("employee_id", employee.employeeId).in("status", ["approved", "disbursed", "repaying"]),
    ]);
    savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
    activeLoanBalance = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.outstanding_balance ?? 0), 0);
  }

  const maxBorrowable = Math.max(0, savingsBalance * 3 - activeLoanBalance);
  const guarantorEmployees = (guarantorEmployeesRes.data ?? [])
    .filter((e: any) => e.id !== employee!.employeeId)
    .map((e: any) => ({
      ...e,
      account_number: e.savings?.[0]?.account_number ?? null,
    }));

  const raw = employeeDetailsRes.data as any;
  const employeeDetails = raw
    ? {
        name: `${raw.first_name} ${raw.last_name}`,
        employeeNo: raw.employee_no,
        department: raw.department,
        accountNumber: raw.savings?.[0]?.account_number ?? null,
        yearsInService: raw.date_joined
          ? Math.max(0, new Date().getFullYear() - new Date(raw.date_joined).getFullYear())
          : 0,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Apply for a Facility</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Submit a new facility application
        </p>
      </div>
      <LoanApplication
        loanProducts={loanProductsRes.data ?? []}
        employeeDetails={employeeDetails}
        maxBorrowable={maxBorrowable}
        savingsBalance={savingsBalance}
        activeLoanBalance={activeLoanBalance}
        guarantorEmployees={guarantorEmployees as any}
      />
    </div>
  );
}
