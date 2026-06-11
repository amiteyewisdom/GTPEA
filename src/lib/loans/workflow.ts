export const APPROVAL_STAGES = [
  { stage: 1, role: "union_rep", label: "Union Rep" },
  { stage: 2, role: "fund_manager", label: "Fund Manager" },
  { stage: 3, role: "chairperson", label: "Chairperson" },
] as const;

export type ApproverRole = (typeof APPROVAL_STAGES)[number]["role"];

export function roleForStage(stage: number): ApproverRole | null {
  return APPROVAL_STAGES.find((item) => item.stage === stage)?.role ?? null;
}

export function labelForStage(stage: number): string {
  return APPROVAL_STAGES.find((item) => item.stage === stage)?.label ?? `Stage ${stage}`;
}

export function labelForRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function canApproveAtStage(userRole: string, stage: number): boolean {
  if (userRole === "super_admin" || userRole === "administrator") {
    return true;
  }

  return roleForStage(stage) === userRole;
}

export function successMessageAfterApproval(action: "approved" | "rejected", stage: number, isFinal: boolean) {
  if (action === "rejected") {
    return "Application rejected. The employee has been notified.";
  }

  if (isFinal) {
    return "Final approval complete. The loan is now approved.";
  }

  const nextRole = roleForStage(stage + 1);
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
