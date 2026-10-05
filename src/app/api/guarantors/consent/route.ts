import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { request_id, action, notes } = body;

    if (!request_id || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required." },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const guarantor = await getLoggedInEmployee(supabase);

    if (!guarantor) {
      return NextResponse.json(
        { error: "Guarantor profile not found." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get the guarantor request
    const guarantorRequestRes = await admin
      .from("loan_guarantors")
      .select("id, guarantor_id, loan_id, loans!inner (employee_id, loan_ref)")
      .eq("id", request_id)
      .single();

    if (guarantorRequestRes.error || !guarantorRequestRes.data) {
      return NextResponse.json(
        { error: "Guarantor request not found." },
        { status: 404 }
      );
    }

    const guarantorRequest = guarantorRequestRes.data as {
      id: string;
      guarantor_id: string;
      loan_id: string;
      loans: {
        employee_id: string;
        loan_ref: string;
      };
    };

    // Verify the logged-in user is the guarantor
    if (guarantorRequest.guarantor_id !== guarantor.employeeId) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this request." },
        { status: 403 }
      );
    }

    // Update consent status
    const updateRes = await admin
      .from("loan_guarantors")
      .update({
        consent_status: action,
        consent_responded_at: new Date().toISOString(),
        consent_notes: notes || null,
      })
      .eq("id", request_id);

    if (updateRes.error) {
      return NextResponse.json(
        { error: updateRes.error.message },
        { status: 500 }
      );
    }

    // Resolve the applicant's auth user via profiles.employee_id —
    // the employees table has no user_id column.
    const applicantProfileRes = await admin
      .from("profiles")
      .select("user_id")
      .eq("employee_id", guarantorRequest.loans.employee_id)
      .maybeSingle();
    const applicantUserId = applicantProfileRes.data?.user_id ?? null;

    // A guarantor rejection rejects the loan application itself — the employee
    // sees the rejected state + reason in My Loans and can amend & resubmit,
    // which sends the request back to the guarantor.
    if (action === "rejected") {
      const loanRejectRes = await admin
        .from("loans")
        .update({
          status: "rejected",
          notes: `Guarantor declined${notes ? `: ${notes}` : "."}`,
        })
        .eq("id", guarantorRequest.loan_id);
      if (loanRejectRes.error) {
        console.error("[/api/guarantors/consent] loan reject update error:", loanRejectRes.error);
      }
    }

    // Notify the loan applicant about the guarantor's decision
    if (applicantUserId) {
      await admin.from("notifications").insert({
        user_id: applicantUserId,
        type: "system",
        title: action === "approved" ? "Guarantor Consent Approved" : "Guarantor Consent Rejected",
        message: action === "approved"
          ? `A guarantor has approved the request for loan ${guarantorRequest.loans.loan_ref}. It will be sent to the Fund Manager after all selected guarantors approve.`
          : `Your guarantor has rejected the request for loan ${guarantorRequest.loans.loan_ref}. ${notes ? `Reason: ${notes}. ` : ""}You can amend the application and resubmit it.`,
        entity_type: "loan",
        entity_id: guarantorRequest.loan_id,
      });
    }

    // If action is approved, check if at least one guarantor has consented
    if (action === "approved") {
      const allGuarantorsRes = await admin
        .from("loan_guarantors")
        .select("consent_status, guarantor_id")
        .eq("loan_id", guarantorRequest.loan_id);

      const allGuarantors = allGuarantorsRes.data || [];
      const allApproved = allGuarantors.length > 0 &&
        allGuarantors.every((g: any) => g.consent_status === "approved");

      if (allApproved) {
        // Every selected guarantor has consented — move the loan into the
        // approval pipeline (stage 1 = Fund Manager).
        const loanUpdateRes = await admin
          .from("loans")
          .update({ status: "pending" })
          .eq("id", guarantorRequest.loan_id);
        if (loanUpdateRes.error) {
          console.error("[/api/guarantors/consent] Loan status update error:", loanUpdateRes.error);
        }

        if (!applicantUserId) {
          console.error("[/api/guarantors/consent] No profile for applicant:", guarantorRequest.loans.employee_id);
          return NextResponse.json(
            { error: "Consent recorded, but the applicant has no linked profile — could not start the approval workflow." },
            { status: 500 }
          );
        }

        // Idempotent: skip if an approval record already exists for this loan
        const existingApproval = await admin
          .from("approvals")
          .select("id")
          .eq("entity_type", "loan")
          .eq("entity_id", guarantorRequest.loan_id)
          .maybeSingle();

        if (!existingApproval.data) {
          const approvalInsert = await admin.from("approvals").insert({
            entity_type: "loan",
            entity_id: guarantorRequest.loan_id,
            status: "pending",
            current_stage: 1,
            total_stages: 3,
            submitted_by: applicantUserId,
          });

          if (approvalInsert.error) {
            console.error("[/api/guarantors/consent] Failed to create approval record:", approvalInsert.error);
            return NextResponse.json(
              { error: `Consent recorded, but the approval workflow could not be started: ${approvalInsert.error.message}` },
              { status: 500 }
            );
          }

          // Notify Fund Managers that a stage-1 approval is waiting
          const reviewersRes = await admin
            .from("profiles")
            .select("user_id")
            .eq("role", "fund_manager");
          for (const reviewer of (reviewersRes.data ?? []) as { user_id: string }[]) {
            await (admin.from("notifications") as any).insert({
              user_id: reviewer.user_id,
              type: "approval_required",
              title: "Loan application needs your review",
              message: `Facility ${guarantorRequest.loans.loan_ref} needs your review at stage 1.`,
              entity_type: "loan",
              entity_id: guarantorRequest.loan_id,
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: action === "approved"
        ? "Guarantor consent approved successfully."
        : "Guarantor consent rejected successfully.",
    });
  } catch (err: any) {
    console.error("[/api/guarantors/consent] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
