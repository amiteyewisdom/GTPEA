import { NextResponse } from "next/server";
import { addMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import { calculateMonthlyRepayment, formatCurrency, generateReference } from "@/utils/formatters";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    return await handleApply(body);
  } catch (err: any) {
    console.error("[/api/loans/apply] Unhandled error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error." }, { status: 500 });
  }
}

async function handleApply(body: any) {
  const principal = Number(body?.principal);
  const durationMonths = Number(body?.duration_months);
  const loanProductId = String(body?.loan_product_id || "");
  const purpose = String(body?.purpose || "").trim();
  const guarantorId = body?.guarantor_id ? String(body.guarantor_id) : null;
  const guarantorName = body?.guarantor_name ? String(body.guarantor_name) : null;
  const guarantorStaffId = body?.guarantor_staff_id ? String(body.guarantor_staff_id) : null;
  const guarantorAccount = body?.guarantor_account ? String(body.guarantor_account) : null;
  const guarantorAmount = body?.guarantor_amount ? Number(body.guarantor_amount) : null;
  const additionalGuarantors = Array.isArray(body?.additional_guarantors)
    ? body.additional_guarantors
        .filter((g: any) => g?.guarantor_id)
        .map((g: any) => ({
          guarantor_id: String(g.guarantor_id),
          account_number: g?.guarantor_account ? String(g.guarantor_account) : null,
          amount: g?.guarantor_amount ? Number(g.guarantor_amount) : null,
        }))
    : [];

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
      { status: 400 }
    );
  }

  if (employee.role !== "employee") {
    return NextResponse.json(
      { error: "Only employees can apply for loans." },
      { status: 403 }
    );
  }

  const productRes = await supabase
    .from("loan_products")
    .select("id, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, is_active, requires_guarantor")
    .eq("id", loanProductId)
    .single();

  const product = productRes.data as {
    id: string;
    interest_rate: number;
    interest_calc_method: 'reducing_balance' | 'flat_rate';
    min_amount: number;
    max_amount: number;
    min_term_months: number;
    max_term_months: number;
    is_active: boolean;
    requires_guarantor: boolean;
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

  const allGuarantorIds = [guarantorId, ...additionalGuarantors.map((g) => g.guarantor_id)].filter(Boolean) as string[];

  const [savingsRes, loansRes] = await Promise.all([
    supabase.from("savings").select("balance").eq("employee_id", employee.employeeId).eq("status", "active"),
    supabase.from("loans").select("outstanding_balance").eq("employee_id", employee.employeeId).in("status", ["approved", "disbursed", "repaying"]),
  ]);
  const savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
  const activeLoanBalance = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.outstanding_balance ?? 0), 0);
  const requiresGuarantor = product.requires_guarantor && savingsBalance <= activeLoanBalance;

  if (allGuarantorIds.length > 2) {
    return NextResponse.json({ error: "You can list at most 2 guarantors." }, { status: 400 });
  }

  if (requiresGuarantor && allGuarantorIds.length === 0) {
    return NextResponse.json({ error: "This product requires a guarantor." }, { status: 400 });
  }

  if (allGuarantorIds.some((id) => id === employee.employeeId)) {
    return NextResponse.json({ error: "You cannot guarantee your own facility." }, { status: 400 });
  }

  if (new Set(allGuarantorIds).size !== allGuarantorIds.length) {
    return NextResponse.json({ error: "Each guarantor can only be listed once." }, { status: 400 });
  }

  const calcMethod = product.interest_calc_method ?? 'reducing_balance';
  const monthlyRepayment = calculateMonthlyRepayment(
    principal,
    Number(product.interest_rate),
    durationMonths,
    calcMethod
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
      interest_calc_method: calcMethod,
      processing_fee: 0,
      term_months: durationMonths,
      monthly_repayment: monthlyRepayment,
      status: "pending",
      purpose: purpose || null,
      expected_completion_date: addMonths(new Date(), durationMonths).toISOString(),
      guarantor_id: guarantorId || null,
      guarantor_account: guarantorAccount || null,
      guarantor_amount: guarantorAmount || null,
      notes:
        guarantorName && guarantorStaffId
          ? `Guarantor: ${guarantorName} (${guarantorStaffId})${guarantorAccount ? ` - Ac/No: ${guarantorAccount}` : ""}`
          : null,
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
    total_stages: 4,
    submitted_by: employee.userId,
  });

  if (approvalRes.error) {
    await admin.from("loans").delete().eq("id", loanRes.data.id);
    return NextResponse.json(
      { error: approvalRes.error.message ?? "Could not start approval workflow." },
      { status: 500 }
    );
  }

  // Persist all guarantors and notify them
  const primary = guarantorId
    ? { guarantor_id: guarantorId, account_number: guarantorAccount, amount: guarantorAmount }
    : null;
  const allGuarantorRows = [
    ...(primary ? [primary] : []),
    ...additionalGuarantors,
  ];

  if (allGuarantorRows.length > 0) {
    await (admin.from("loan_guarantors") as any).insert(
      allGuarantorRows.map((g) => ({
        loan_id: loanRes.data.id,
        guarantor_id: g.guarantor_id,
        account_number: g.account_number || null,
        amount: g.amount || null,
      }))
    );

    for (const g of allGuarantorRows) {
      const { data: guarantor } = await admin
        .from("employees")
        .select("user_id, first_name, last_name, employee_no")
        .eq("id", g.guarantor_id)
        .maybeSingle();
      if (guarantor?.user_id) {
        await (admin.from("notifications") as any).insert({
          user_id: guarantor.user_id,
          type: "guarantor_request",
          title: "Guarantor Request",
          message: `You have been listed as a guarantor for facility ${loanRef}.`,
          related_type: "loan",
          related_id: loanRes.data.id,
        });
      }
    }
  }

  return NextResponse.json({
    message: "Facility application submitted. The Facility Committee will review it first.",
    loan: loanRes.data,
  });
}
