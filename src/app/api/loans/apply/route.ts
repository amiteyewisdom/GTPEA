import { NextResponse } from "next/server";
import { addMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import { calculateMonthlyRepayment, formatCurrency, generateReference } from "@/utils/formatters";

export async function POST(request: Request) {
  const body = await request.json();
  const principal = Number(body?.principal);
  const durationMonths = Number(body?.duration_months);
  const loanProductId = String(body?.loan_product_id || "");
  const purpose = String(body?.purpose || "").trim();

  if (!principal || principal <= 0) {
    return NextResponse.json({ error: "Enter a valid loan amount." }, { status: 400 });
  }

  if (!durationMonths || durationMonths < 1) {
    return NextResponse.json({ error: "Loan term must be at least 1 month." }, { status: 400 });
  }

  if (!loanProductId) {
    return NextResponse.json({ error: "Select a loan product." }, { status: 400 });
  }

  const supabase = await createClient();
  const employee = await getLoggedInEmployee(supabase);

  if (!employee) {
    return NextResponse.json(
      { error: "Employee profile not found. Make sure your account is linked to an employee record." },
      { status: 404 }
    );
  }

  const productRes = await supabase
    .from("loan_products")
    .select("id, interest_rate, min_amount, max_amount, min_term_months, max_term_months, is_active")
    .eq("id", loanProductId)
    .single();

  const product = productRes.data as {
    id: string;
    interest_rate: number;
    min_amount: number;
    max_amount: number;
    min_term_months: number;
    max_term_months: number;
    is_active: boolean;
  } | null;

  if (productRes.error || !product) {
    return NextResponse.json({ error: "Loan product not found." }, { status: 404 });
  }

  if (!product.is_active) {
    return NextResponse.json({ error: "This loan product is not available." }, { status: 400 });
  }

  const minAmount = Number(product.min_amount);
  const maxAmount = Number(product.max_amount);
  const minTerm = Number(product.min_term_months);
  const maxTerm = Number(product.max_term_months);

  if (principal < minAmount || principal > maxAmount) {
    return NextResponse.json(
      {
        error: `Amount must be between ${formatCurrency(minAmount)} and ${formatCurrency(maxAmount)} for this product.`,
      },
      { status: 400 }
    );
  }

  if (durationMonths < minTerm || durationMonths > maxTerm) {
    return NextResponse.json(
      { error: `Loan term must be between ${minTerm} and ${maxTerm} months for this product.` },
      { status: 400 }
    );
  }

  const monthlyRepayment = calculateMonthlyRepayment(
    principal,
    Number(product.interest_rate),
    durationMonths
  );
  const loanRef = generateReference("LOAN");
  const admin = createAdminClient();

  const loanRes = await (admin.from("loans") as any)
    .insert({
      loan_ref: loanRef,
      employee_id: employee.employeeId,
      loan_product_id: product.id,
      amount_requested: principal,
      amount_approved: null,
      amount_disbursed: null,
      outstanding_balance: 0,
      interest_rate: Number(product.interest_rate),
      processing_fee: 0,
      term_months: durationMonths,
      monthly_repayment: monthlyRepayment,
      status: "pending",
      purpose: purpose || null,
      expected_completion_date: addMonths(new Date(), durationMonths).toISOString(),
    })
    .select("id, loan_ref, status, amount_requested, term_months")
    .single();

  if (loanRes.error || !loanRes.data) {
    return NextResponse.json(
      { error: loanRes.error?.message ?? "Could not create loan application." },
      { status: 500 }
    );
  }

  const approvalRes = await (admin.from("approvals") as any).insert({
    entity_type: "loan",
    entity_id: loanRes.data.id,
    status: "pending",
    current_stage: 1,
    total_stages: 3,
    submitted_by: employee.userId,
  });

  if (approvalRes.error) {
    await admin.from("loans").delete().eq("id", loanRes.data.id);
    return NextResponse.json(
      { error: approvalRes.error.message ?? "Could not start approval workflow." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Loan application submitted. Union rep will review it first.",
    loan: loanRes.data,
  });
}
