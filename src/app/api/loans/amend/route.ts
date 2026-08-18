import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import { calculateMonthlyRepayment } from "@/utils/formatters";
import { APPROVAL_STAGES } from "@/lib/loans/workflow";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    return await handleAmend(body);
  } catch (err: any) {
    console.error("[/api/loans/amend] Unhandled error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error." }, { status: 500 });
  }
}

async function handleAmend(body: any) {
  const loanId = String(body?.loan_id || "");
  const principal = Number(body?.amount_requested);
  const durationMonths = Number(body?.term_months);
  const loanProductId = String(body?.loan_product_id || "");
  const purpose = String(body?.purpose || "").trim();

  if (!loanId) {
    return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Only employees can amend facility applications." }, { status: 403 });
  }

  const [productRes, loanRes, guarantorsRes, existingApprovalRes] = await Promise.all([
    supabase
      .from("loan_products")
      .select("id, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, is_active, requires_guarantor")
      .eq("id", loanProductId)
      .single(),
    supabase
      .from("loans")
      .select("id, employee_id, status, loan_guarantors(guarantor_id)")
      .eq("id", loanId)
      .eq("employee_id", employee.employeeId)
      .single(),
    supabase.from("loan_guarantors").select("guarantor_id").eq("loan_id", loanId),
    supabase
      .from("approvals")
      .select("id, status, rejection_stage, rejection_reason")
      .eq("entity_id", loanId)
      .eq("entity_type", "loan")
      .single(),
  ]);

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

  const loan = loanRes.data as { id: string; employee_id: string; status: string } | null;
  if (loanRes.error || !loan) {
    return NextResponse.json({ error: "Loan not found or you do not have permission to amend it." }, { status: 404 });
  }

  if (!["pending", "rejected"].includes(loan.status)) {
    return NextResponse.json({ error: "Only pending or rejected applications can be amended." }, { status: 400 });
  }

  const minAmount = Number(product.min_amount);
  const maxAmount = Number(product.max_amount);
  const minTerm = Number(product.min_term_months);
  const maxTerm = Number(product.max_term_months);

  if (principal < minAmount || principal > maxAmount) {
    return NextResponse.json({ error: `Amount must be between ${minAmount} and ${maxAmount}.` }, { status: 400 });
  }

  if (durationMonths < minTerm || durationMonths > maxTerm) {
    return NextResponse.json({ error: `Term must be between ${minTerm} and ${maxTerm} months.` }, { status: 400 });
  }

  const [savingsRes, loansRes] = await Promise.all([
    supabase.from("savings").select("balance").eq("employee_id", employee.employeeId).eq("status", "active"),
    supabase.from("loans").select("outstanding_balance").eq("employee_id", employee.employeeId).in("status", ["approved", "disbursed", "repaying"]),
  ]);
  const savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
  const activeLoanBalance = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.outstanding_balance ?? 0), 0);
  const requiresGuarantor = product.requires_guarantor && savingsBalance <= activeLoanBalance;

  const existingGuarantors = guarantorsRes.data ?? [];
  if (requiresGuarantor && existingGuarantors.length === 0) {
    return NextResponse.json({ error: "This product requires a guarantor." }, { status: 400 });
  }

  const calcMethod = product.interest_calc_method ?? 'reducing_balance';
  const monthlyRepayment = calculateMonthlyRepayment(principal, Number(product.interest_rate), durationMonths, calcMethod);

  const admin = createAdminClient();

  const updateRes = await (admin.from("loans") as any)
    .update({
      loan_product_id: product.id,
      amount_requested: principal,
      term_months: durationMonths,
      interest_rate: product.interest_rate,
      interest_calc_method: calcMethod,
      monthly_repayment: monthlyRepayment,
      purpose,
      amount_approved: null,
      amount_disbursed: null,
      outstanding_balance: 0,
      status: "pending",
      rejection_reason_code: null,
      approved_by: null,
      approved_at: null,
      disbursed_by: null,
      disbursement_date: null,
    })
    .eq("id", loanId);

  if (updateRes.error) {
    console.error("[/api/loans/amend] loan update error:", updateRes.error);
    return NextResponse.json({ error: updateRes.error.message }, { status: 500 });
  }

  // Reset approval workflow
  const existingApprovals = await (admin.from("approvals") as any).select("id").eq("entity_id", loanId).eq("entity_type", "loan");
  if (existingApprovals.data?.length) {
    const approvalIds = existingApprovals.data.map((a: any) => a.id);
    await (admin.from("approval_actions") as any).delete().in("approval_id", approvalIds);
    await (admin.from("approvals") as any).delete().in("id", approvalIds);
  }

  // If this was a rejected loan, skip to the rejection stage
  const existingApproval = existingApprovalRes.data as { status: string; rejection_stage?: number; rejection_reason?: string } | null;
  const startStage = (existingApproval?.status === "rejected" && existingApproval.rejection_stage) ? existingApproval.rejection_stage : 1;

  const approvalRes = await (admin.from("approvals") as any).insert({
    entity_type: "loan",
    entity_id: loanId,
    status: "pending",
    current_stage: startStage,
    total_stages: APPROVAL_STAGES.length,
    submitted_by: employee.userId,
    rejection_stage: existingApproval?.rejection_stage || null,
    rejection_reason: existingApproval?.rejection_reason || null,
  });

  if (approvalRes.error) {
    console.error("[/api/loans/amend] approval insert error:", approvalRes.error);
    return NextResponse.json({ error: approvalRes.error.message }, { status: 500 });
  }

  const message = startStage > 1
    ? `Facility application amended. It will go directly to ${existingApproval?.rejection_stage === 2 ? 'Union Rep' : existingApproval?.rejection_stage === 3 ? 'Fund Manager' : 'Chairperson'} for review.`
    : "Facility application amended. The Facility Committee will review it first.";

  return NextResponse.json({
    message,
    loan: { id: loanId },
  });
}
