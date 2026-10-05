import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import { borrowingCapacity, committedLoanAmount } from "@/lib/loans/capacity";
import { calculateMonthlyRepayment, formatCurrency } from "@/utils/formatters";
import { labelForRole, roleForStage } from "@/lib/loans/workflow";

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
  const admin = createAdminClient();
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
      .select("id, employee_id, status, loan_ref, loan_guarantors(guarantor_id)")
      .eq("id", loanId)
      .eq("employee_id", employee.employeeId)
      .single(),
    supabase.from("loan_guarantors").select("id, guarantor_id, consent_status").eq("loan_id", loanId),
    supabase
      .from("approvals")
      .select("id, status, current_stage")
      .eq("entity_id", loanId)
      .eq("entity_type", "loan")
      .maybeSingle(),
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

  const loan = loanRes.data as { id: string; employee_id: string; status: string; loan_ref: string } | null;
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
    supabase.from("loans").select("id, outstanding_balance, amount_approved, amount_requested, status").eq("employee_id", employee.employeeId),
  ]);
  const savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
  const memberLoans = (loansRes.data ?? []) as any[];
  // Borrowing cap applies to amendments too — exclude the loan being amended
  // since its new amount is what's being checked.
  const otherLoans = memberLoans.filter((l: any) => l.id !== loanId);
  const maxBorrowable = borrowingCapacity(savingsBalance, otherLoans);
  if (principal > maxBorrowable) {
    return NextResponse.json(
      { error: `Amount exceeds your borrowing capacity of ${formatCurrency(maxBorrowable)} (3× savings minus current loans).` },
      { status: 400 }
    );
  }

  const requiresGuarantor = principal > savingsBalance;
  const existingGuarantors = (guarantorsRes.data ?? []) as { id: string; guarantor_id: string; consent_status?: string }[];
  if (requiresGuarantor && existingGuarantors.length === 0) {
    return NextResponse.json({ error: "This amount exceeds your savings and requires at least one guarantor." }, { status: 400 });
  }

  if (requiresGuarantor) {
    const guarantorIds = existingGuarantors.map((row: any) => row.guarantor_id);
    const [guarantorSavingsRes, guarantorLoansRes] = await Promise.all([
      admin.from("savings").select("employee_id, balance").eq("status", "active").in("employee_id", guarantorIds),
      admin.from("loans").select("employee_id, outstanding_balance, amount_approved, amount_requested, status").in("employee_id", guarantorIds),
    ]);
    const guarantorCover = guarantorIds.reduce((total: number, id: string) => {
      const savings = (guarantorSavingsRes.data ?? []).filter((row: any) => row.employee_id === id)
        .reduce((sum: number, row: any) => sum + Number(row.balance ?? 0), 0);
      const committed = (guarantorLoansRes.data ?? []).filter((row: any) => row.employee_id === id)
        .reduce((sum: number, row: any) => sum + committedLoanAmount(row), 0);
      return total + Math.max(0, savings - committed);
    }, 0);
    if (savingsBalance + guarantorCover < principal) {
      return NextResponse.json({ error: "The existing guarantor cover is insufficient for the amended amount." }, { status: 400 });
    }
  }

  const calcMethod = product.interest_calc_method ?? 'reducing_balance';
  const monthlyRepayment = calculateMonthlyRepayment(principal, Number(product.interest_rate), durationMonths, calcMethod);

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
      approved_by: null,
      disbursed_by: null,
      disbursement_date: null,
      notes: null,
      guarantor_id: requiresGuarantor ? existingGuarantors[0]?.guarantor_id ?? null : null,
    })
    .eq("id", loanId);

  if (updateRes.error) {
    console.error("[/api/loans/amend] loan update error:", updateRes.error);
    return NextResponse.json({ error: updateRes.error.message }, { status: 500 });
  }

  if (!requiresGuarantor && existingGuarantors.length > 0) {
    await (admin.from("loan_guarantors") as any).delete().eq("loan_id", loanId);
  }

  // Determine where the amended application resumes BEFORE deleting the old
  // workflow rows. A rejected approval's current_stage is the stage that
  // rejected it — rejection never advances it.
  const existingApproval = existingApprovalRes.data as { id: string; status: string; current_stage: number } | null;
  const resumeStage = existingApproval?.status === "rejected" ? existingApproval.current_stage : null;
  const existingGuarantorRows = (existingGuarantors ?? []) as { id: string; guarantor_id: string; consent_status?: string }[];

  // Reset approval workflow
  const existingApprovals = await (admin.from("approvals") as any).select("id").eq("entity_id", loanId).eq("entity_type", "loan");
  if (existingApprovals.data?.length) {
    const approvalIds = existingApprovals.data.map((a: any) => a.id);
    await (admin.from("approval_actions") as any).delete().in("approval_id", approvalIds);
    await (admin.from("approvals") as any).delete().in("id", approvalIds);
  }

  let message: string;

  if (requiresGuarantor && !resumeStage && existingGuarantorRows.length > 0) {
    // Guarantor consent was declined (or never collected) — the amended
    // application goes back to the guarantor first, not the board.
    const consentResetRes = await (admin.from("loan_guarantors") as any)
      .update({
        consent_status: "pending",
        consent_responded_at: null,
        consent_notes: null,
      })
      .eq("loan_id", loanId);
    if (consentResetRes.error) {
      console.error("[/api/loans/amend] guarantor consent reset error:", consentResetRes.error);
      return NextResponse.json({ error: consentResetRes.error.message }, { status: 500 });
    }

    for (const g of existingGuarantorRows) {
      const { data: guarantorProfile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("employee_id", g.guarantor_id)
        .maybeSingle();
      if (guarantorProfile?.user_id) {
        await (admin.from("notifications") as any).insert({
          user_id: guarantorProfile.user_id,
          type: "approval_required",
          title: "Guarantor Request",
          message: `The applicant has amended facility ${loan.loan_ref} — please review and consent again.`,
          entity_type: "loan",
          entity_id: loanId,
        });
      }
    }

    message = "Facility application amended and sent back to your guarantor for consent.";
  } else {
    // Rejected by the board → resume at the stage that rejected it.
    // No prior approval row → first submission → start at stage 1.
    const startStage = resumeStage ?? 1;

    const approvalRes = await (admin.from("approvals") as any).insert({
      entity_type: "loan",
      entity_id: loanId,
      status: "pending",
      current_stage: startStage,
      total_stages: 3,
      submitted_by: employee.userId,
    });

    if (approvalRes.error) {
      console.error("[/api/loans/amend] approval insert error:", approvalRes.error);
      return NextResponse.json({ error: approvalRes.error.message }, { status: 500 });
    }

    const resumeRole = roleForStage(startStage, "loan");
    if (resumeRole) {
      const approversRes = await (admin.from("profiles") as any).select("user_id").eq("role", resumeRole);
      for (const approver of (approversRes.data ?? []) as { user_id: string }[]) {
        await (admin.from("notifications") as any).insert({
          user_id: approver.user_id,
          type: "approval_required",
          title: "Amended loan needs your review",
          message: `An amended facility application needs your review at stage ${startStage}.`,
          entity_type: "loan",
          entity_id: loanId,
        });
      }
    }

    message = resumeStage
      ? `Facility application amended and sent back to the ${labelForRole(resumeRole ?? "approver")} who rejected it.`
      : "Facility application amended and resubmitted. The Fund Manager will review it first.";
  }

  return NextResponse.json({
    message,
    loan: { id: loanId },
  });
}
