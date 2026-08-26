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

    // Notify the loan applicant about the guarantor's decision
    const employeeRes = await admin
      .from("employees")
      .select("user_id")
      .eq("id", guarantorRequest.loans.employee_id)
      .single();

    if (employeeRes.data) {
      await admin.from("notifications").insert({
        user_id: employeeRes.data.user_id,
        type: action === "approved" ? "guarantor_consent_approved" : "guarantor_consent_rejected",
        title: action === "approved" ? "Guarantor Consent Approved" : "Guarantor Consent Rejected",
        message: action === "approved"
          ? `Your guarantor has approved the request for loan ${guarantorRequest.loans.loan_ref}.`
          : `Your guarantor has rejected the request for loan ${guarantorRequest.loans.loan_ref}. ${notes ? `Reason: ${notes}` : ""}`,
        related_type: "loan",
        related_id: guarantorRequest.loan_id,
      });
    }

    // If action is approved, check if all guarantors have consented
    if (action === "approved") {
      const allGuarantorsRes = await admin
        .from("loan_guarantors")
        .select("consent_status")
        .eq("loan_id", guarantorRequest.loan_id);

      const allGuarantors = allGuarantorsRes.data || [];
      const allApproved = allGuarantors.every((g: any) => g.consent_status === "approved");

      if (allApproved) {
        // All guarantors have consented, move loan to pending status
        await admin
          .from("loans")
          .update({ status: "pending" })
          .eq("id", guarantorRequest.loan_id);

        // Create approval record
        const loanRes = await admin
          .from("loans")
          .select("employee_id")
          .eq("id", guarantorRequest.loan_id)
          .single();

        if (loanRes.data) {
          const profileRes = await admin
            .from("profiles")
            .select("user_id")
            .eq("employee_id", loanRes.data.employee_id)
            .single();

          if (profileRes.data) {
            await admin.from("approvals").insert({
              entity_type: "loan",
              entity_id: guarantorRequest.loan_id,
              status: "pending",
              current_stage: 1,
              total_stages: 4,
              submitted_by: profileRes.data.user_id,
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
