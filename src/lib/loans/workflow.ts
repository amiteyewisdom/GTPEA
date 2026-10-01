export const APPROVAL_STAGES = [
  { stage: 1, role: "union_rep", label: "Relief Committee" },
  { stage: 2, role: "fund_manager", label: "Fund Manager" },
  { stage: 3, role: "chairperson", label: "Chairperson" },
] as const;

export type ApproverRole = (typeof APPROVAL_STAGES)[number]["role"];

export function roleForStage(stage: number, entityType?: string): ApproverRole | null {
  // Withdrawals only need Fund Manager approval (single stage)
  if (entityType === "withdrawal") {
    return "fund_manager";
  }
  return APPROVAL_STAGES.find((item) => item.stage === stage)?.role ?? null;
}

export function labelForStage(stage: number): string {
  return APPROVAL_STAGES.find((item) => item.stage === stage)?.label ?? `Stage ${stage}`;
}

export function labelForRole(role: string): string {
  if (role === "union_rep") return "Relief Committee";
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function canApproveAtStage(userRole: string, stage: number, entityType?: string): boolean {
  if (userRole === "super_admin" || userRole === "administrator") {
    return true;
  }

  return roleForStage(stage, entityType) === userRole;
}

export function successMessageAfterApproval(action: "approved" | "rejected", stage: number, isFinal: boolean, entityType?: string) {
  if (action === "rejected") {
    return "Application rejected. The employee has been notified.";
  }

  if (isFinal) {
    return entityType === "withdrawal"
      ? "Withdrawal approved. Amount has been deducted from savings balance."
      : "Final approval complete. The loan is now approved.";
  }

  const nextRole = roleForStage(stage + 1, entityType);
  if (!nextRole) {
    return "Application approved.";
  }

  return `Approved. Waiting for ${labelForRole(nextRole)} (stage ${stage + 1}).`;
}

export function employeeStageLabel(stage: number, status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return `Waiting for ${labelForStage(stage)}`;
}
