import { formatCurrency } from "@/utils/formatters";

export type LoanApprovalQueueItem = {
  approvalId: string;
  loanId: string;
  applicant: string;
  amount: string;
  amountValue: number;
  duration: string;
  purpose: string;
  currentStage: number;
  totalStages: number;
  riskScore: string;
};

function employeeName(loan: any) {
  return `${loan.employees?.first_name || ""} ${loan.employees?.last_name || ""}`.trim() || "Unknown";
}

function riskScoreFor(amount: number) {
  if (amount > 100000) return "High";
  if (amount > 50000) return "Medium";
  return "Low";
}

export function buildLoanApprovalQueue(
  approvals: any[],
  loans: any[],
  stage: number
): LoanApprovalQueueItem[] {
  const loanMap = new Map(loans.map((loan) => [loan.id, loan]));

  return approvals
    .filter(
      (approval) =>
        approval.status === "pending" &&
        approval.entity_type === "loan" &&
        approval.current_stage === stage
    )
    .map((approval) => {
      const loan = loanMap.get(approval.entity_id);
      if (!loan) return null;

      const amountValue = Number(loan.amount_requested) || 0;

      return {
        approvalId: approval.id,
        loanId: loan.id,
        applicant: employeeName(loan),
        amount: formatCurrency(amountValue),
        amountValue,
        duration: `${loan.term_months} months`,
        purpose: loan.purpose || "—",
        currentStage: approval.current_stage,
        totalStages: approval.total_stages ?? 3,
        riskScore: riskScoreFor(amountValue),
      };
    })
    .filter((item): item is LoanApprovalQueueItem => item !== null);
}
