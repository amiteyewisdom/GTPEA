/**
 * Loan Amendment and Resubmission Workflow Test
 * This file documents the expected flow when a loan is rejected and amended
 */

/**
 * Expected Workflow:
 * 
 * 1. Employee submits loan application
 * 2. Guarantor approves (if required)
 * 3. Approval record created at stage 1 (Union Rep)
 * 4. Union Rep reviews and can:
 *    - Approve → moves to Fund Manager (stage 2)
 *    - Recommend → moves to Fund Manager (stage 2) 
 *    - Reject → loan status changes to "rejected"
 * 
 * 5. If rejected:
 *    - Employee sees loan as "rejected" in My Loans
 *    - Employee can click "Amend" to modify the loan
 *    - Employee changes amount, term, purpose, etc.
 *    - Employee submits amendment
 * 
 * 6. Amendment process:
 *    - Loan status changes to "pending"
 *    - Old approval record is deleted
 *    - New approval record created at stage 1 (Union Rep)
 *    - If guarantors exist, they need to approve again
 *    - Loan goes through the full approval process again
 * 
 * 7. Final approval:
 *    - Union Rep approves → Fund Manager (stage 2)
 *    - Fund Manager approves → Chairperson (stage 3)
 *    - Chairperson approves → loan status "approved"
 *    - Loan ready for disbursement
 */

export const AMENDMENT_WORKFLOW_STEPS = [
  {
    step: 1,
    description: "Employee submits loan application",
    next: "Guarantor approval (if required)"
  },
  {
    step: 2,
    description: "Guarantor approves request",
    next: "Approval record created at Union Rep stage"
  },
  {
    step: 3,
    description: "Union Rep reviews",
    actions: ["Approve", "Recommend", "Reject"],
    next: "Depends on action"
  },
  {
    step: 4,
    description: "If rejected by Union Rep",
    next: "Employee can amend and resubmit"
  },
  {
    step: 5,
    description: "Employee amends loan",
    changes: ["Amount", "Term", "Purpose", "Product"],
    next: "Approval workflow restarts at Union Rep"
  },
  {
    step: 6,
    description: "Full approval process restarts",
    stages: ["Union Rep", "Fund Manager", "Chairperson"],
    next: "Final approval"
  },
  {
    step: 7,
    description: "Final approval by Chairperson",
    next: "Loan ready for disbursement"
  }
] as const;

export function canAmendLoan(status: string): boolean {
  return status === "pending" || status === "rejected";
}

export function getAmendmentRestrictions(status: string): string | null {
  if (status === "approved") {
    return "Approved loans cannot be amended";
  }
  if (status === "disbursed") {
    return "Disbursed loans cannot be amended";
  }
  if (status === "repaying") {
    return "Active loans cannot be amended";
  }
  if (status === "completed") {
    return "Completed loans cannot be amended";
  }
  return null;
}