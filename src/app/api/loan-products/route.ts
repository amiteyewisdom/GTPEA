// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name || "");
  const description = String(body?.description || "");
  const interestRate = Number(body?.interest_rate);
  const minAmount = Number(body?.min_amount);
  const maxAmount = Number(body?.max_amount);
  const minTermMonths = Number(body?.min_term_months);
  const maxTermMonths = Number(body?.max_term_months);
  const processingFeePercent = Number(body?.processing_fee_percent);
  const requiresGuarantor = Boolean(body?.requires_guarantor);
  const maxLoanToSalaryRatio = Number(body?.max_loan_to_salary_ratio);

  if (!name) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  if (!interestRate || interestRate <= 0) {
    return NextResponse.json({ error: "Interest rate must be greater than zero." }, { status: 400 });
  }

  if (!minAmount || minAmount <= 0) {
    return NextResponse.json({ error: "Minimum amount must be greater than zero." }, { status: 400 });
  }

  if (!maxAmount || maxAmount <= 0) {
    return NextResponse.json({ error: "Maximum amount must be greater than zero." }, { status: 400 });
  }

  if (minAmount > maxAmount) {
    return NextResponse.json({ error: "Minimum amount cannot be greater than maximum amount." }, { status: 400 });
  }

  if (!minTermMonths || minTermMonths < 1) {
    return NextResponse.json({ error: "Minimum term must be at least 1 month." }, { status: 400 });
  }

  if (!maxTermMonths || maxTermMonths < 1) {
    return NextResponse.json({ error: "Maximum term must be at least 1 month." }, { status: 400 });
  }

  if (minTermMonths > maxTermMonths) {
    return NextResponse.json({ error: "Minimum term cannot be greater than maximum term." }, { status: 400 });
  }

  if (!maxLoanToSalaryRatio || maxLoanToSalaryRatio <= 0) {
    return NextResponse.json({ error: "Max loan to salary ratio must be greater than zero." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Create loan product
  const { data: product, error: productError } = await supabase
    .from("loan_products")
    .insert([
      {
        name: name,
        description: description || null,
        interest_rate: interestRate,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_term_months: minTermMonths,
        max_term_months: maxTermMonths,
        processing_fee_percent: processingFeePercent || 0,
        requires_guarantor: requiresGuarantor,
        max_loan_to_salary_ratio: maxLoanToSalaryRatio,
        is_active: true,
        created_by: user.id,
      },
    ] as any)
    .select()
    .single() as any;

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message || "Failed to create loan product." }, { status: 500 });
  }

  return NextResponse.json({ message: "Loan product created successfully", product });
}
