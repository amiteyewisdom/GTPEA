import { NextResponse } from "next/server";
import { addMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthlyRepayment, generateReference } from "@/utils/formatters";

export async function POST(request: Request) {
  const body = await request.json();
  const principal = Number(body?.principal);
  const durationMonths = Number(body?.duration_months);
  const loanProductId = String(body?.loan_product_id || "");
  const purpose = String(body?.purpose || "");

  if (!principal || principal <= 0) {
    return NextResponse.json({ error: "Principal amount must be greater than zero." }, { status: 400 });
  }

  if (!durationMonths || durationMonths < 1) {
    return NextResponse.json({ error: "Duration must be at least one month." }, { status: 400 });
  }

  if (!loanProductId) {
    return NextResponse.json({ error: "Loan product is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const employeeRes = await supabase
    .from("employees")
    .select("id")
    .eq("email", user.email)
    .single();

  if (employeeRes.error || !employeeRes.data) {
    return NextResponse.json({ error: "Employee profile not found." }, { status: 404 });
  }

  const productRes = await supabase
    .from("loan_products")
    .select("id, name, interest_rate, min_amount, max_amount, max_tenure_months, is_active")
    .eq("id", loanProductId)
    .single();

  if (productRes.error || !productRes.data) {
    return NextResponse.json({ error: "Loan product not found." }, { status: 404 });
  }

  const product = productRes.data as {
    id: string;
    interest_rate: number;
    min_amount: number;
    max_amount: number;
    max_tenure_months: number;
    is_active: boolean;
  };

  if (!product.is_active) {
    return NextResponse.json({ error: "Selected loan product is not active." }, { status: 400 });
  }

  if (principal < Number(product.min_amount) || principal > Number(product.max_amount)) {
    return NextResponse.json({ error: "Principal amount is outside the allowed range for this product." }, { status: 400 });
  }

  if (durationMonths > Number(product.max_tenure_months)) {
    return NextResponse.json({ error: "Duration exceeds the maximum allowed term for this product." }, { status: 400 });
  }

  const monthlyRepayment = calculateMonthlyRepayment(principal, Number(product.interest_rate), durationMonths);
  const expectedCompletionDate = addMonths(new Date(), durationMonths).toISOString();
  const loanRef = generateReference("LOAN");

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert([
      {
        loan_ref: loanRef,
        employee_id: employeeRes.data.id,
        loan_product_id: product.id,
        amount_requested: principal,
        amount_approved: null,
        amount_disbursed: null,
        outstanding_balance: principal,
        interest_rate: Number(product.interest_rate),
        processing_fee: 0,
        term_months: durationMonths,
        monthly_repayment: monthlyRepayment,
        status: "pending",
        purpose: purpose || null,
        expected_completion_date: expectedCompletionDate,
      },
    ])
    .select()
    .single();

  if (loanError || !loan) {
    return NextResponse.json({ error: loanError?.message ?? "Unable to create loan request." }, { status: 500 });
  }

  const { error: approvalError } = await supabase.from("approvals").insert([
    {
      entity_type: "loan",
      entity_id: loan.id,
      status: "pending",
      current_stage: 1,
      total_stages: 3,
      submitted_by: user.id,
    },
  ]);

  if (approvalError) {
    return NextResponse.json({ error: approvalError.message ?? "Unable to create approval workflow." }, { status: 500 });
  }

  return NextResponse.json({ message: "Loan application submitted.", loan });
}
