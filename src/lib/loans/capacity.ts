// Borrowing capacity rule: members can borrow up to 3× their savings,
// minus whatever is already committed to loans (pending applications,
// approved-but-undisbursed, and outstanding balances).
// Savings themselves are never touched — this is a limit, not a deduction.

export const CAPACITY_MULTIPLIER = 3;

type CapacityLoan = {
  status: string;
  outstanding_balance?: number | null;
  amount_approved?: number | null;
  amount_requested?: number | null;
};

export function committedLoanAmount(loan: CapacityLoan): number {
  switch (loan.status) {
    case "pending":
      return Number(loan.amount_requested) || 0;
    case "approved":
      return Number(loan.amount_approved) || Number(loan.amount_requested) || 0;
    case "active":
    case "disbursed":
    case "repaying":
    case "defaulted":
      return (
        Number(loan.outstanding_balance) ||
        Number(loan.amount_approved) ||
        Number(loan.amount_requested) ||
        0
      );
    default:
      // completed / paid / rejected — nothing owed
      return 0;
  }
}

export function borrowingCapacity(savingsBalance: number, loans: CapacityLoan[]): number {
  const committed = loans.reduce((sum, l) => sum + committedLoanAmount(l), 0);
  return Math.max(0, savingsBalance * CAPACITY_MULTIPLIER - committed);
}
