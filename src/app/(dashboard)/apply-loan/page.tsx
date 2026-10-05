import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LoanApplication } from "@/features/loans/LoanApplication";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import { borrowingCapacity, committedLoanAmount } from "@/lib/loans/capacity";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Apply for a Facility" };

export default async function ApplyLoanPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const employee = await getLoggedInEmployee(supabase);

  if (!employee || employee.role !== "employee") {
    redirect("/dashboard");
  }

  const [loanProductsRes, employeeDetailsRes, guarantorEmployeesRes] = await Promise.all([
    supabase
      .from("loan_products")
      .select("id, name, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, description, requires_guarantor")
      .eq("is_active", true),
    admin
      .from("employees")
      .select("first_name, last_name, employee_no, department, date_joined, savings(account_number)")
      .eq("id", employee!.employeeId)
      .maybeSingle(),
    admin
      .from("employees")
      .select("id, first_name, last_name, employee_no")
      .eq("status", "active")
      .order("first_name"),
  ]);

  let savingsBalance = 0;
  let activeLoanBalance = 0;
  let memberLoans: any[] = [];

  if (employee?.employeeId) {
    const [savingsRes, loansRes] = await Promise.all([
      supabase.from("savings").select("balance").eq("employee_id", employee.employeeId).eq("status", "active"),
      supabase.from("loans").select("outstanding_balance, amount_approved, amount_requested, status").eq("employee_id", employee.employeeId),
    ]);
    savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
    memberLoans = (loansRes.data ?? []) as any[];
    activeLoanBalance = memberLoans.reduce((s: number, r: any) => s + committedLoanAmount(r), 0);
  }

  const maxBorrowable = borrowingCapacity(savingsBalance, memberLoans);

  const guarantorIds = (guarantorEmployeesRes.data ?? []).map((e: any) => e.id);
  const [guarantorSavingsRes, guarantorLoansRes] = guarantorIds.length
    ? await Promise.all([
        admin.from("savings").select("employee_id, account_number, balance").eq("status", "active").in("employee_id", guarantorIds),
        admin.from("loans").select("employee_id, outstanding_balance, amount_approved, amount_requested, status").in("employee_id", guarantorIds),
      ])
    : [{ data: [] }, { data: [] }];

  const guarantorEmployees = (guarantorEmployeesRes.data ?? [])
    .filter((e: any) => e.id !== employee!.employeeId)
    .map((e: any) => {
      const savings = (guarantorSavingsRes.data ?? []).filter((s: any) => s.employee_id === e.id);
      const loans = (guarantorLoansRes.data ?? []).filter((loan: any) => loan.employee_id === e.id);
      const totalSavings = savings.reduce((sum: number, row: any) => sum + Number(row.balance ?? 0), 0);
      const committed = loans.reduce((sum: number, loan: any) => sum + committedLoanAmount(loan), 0);
      return {
        ...e,
        account_number: savings[0]?.account_number ?? null,
        available_cover: Math.max(0, totalSavings - committed),
      };
    })
    .filter((e: any) => e.available_cover > 0);

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
