// GTPEA chart of accounts, reconstructed from the system's own conventions:
//  - loan_products.account_code (20260612000000_gtpea_corrections.sql) and the
//    imported member account numbers, e.g. 62101001P0770 = GL code + staff ID
//  - savings account prefixes (63101001 = members savings, 62131001 = quick cash)
//  - consumable_items.account_code (61101001 food, 61101002 electrical)
//  - report codes already in use: 11101001 interest income, 63101003 dividends
//
// 11101002 (fees & penalties), 64101001 (fund expenses) and 12101001 (cash/bank
// balancing figure) extend those existing families — the system had no code
// for them.

export const GL = {
  cashAndBank: "12101001",
  interestIncome: "11101001",
  feesAndPenalties: "11101002",
  consumablesFood: "61101001",
  consumablesElectrical: "61101002",
  membersSavings: "63101001",
  dividends: "63101003",
  fundExpenses: "64101001",
} as const;

/** Canonical GL code per loan product name (matches loan_products.account_code). */
export const LOAN_PRODUCT_CODES: Record<string, string> = {
  "Normal Loan": "62101001",
  "School Fees": "62111001",
  "Hire Purchase": "62121001",
  "Quick Cash": "62131001",
  Land: "62141001",
  "Land Loan": "62141001",
  "Car Loan": "62161001",
};

export const LOAN_ACCOUNT_NAMES: Record<string, string> = {
  "62101001": "Normal Loan",
  "62111001": "School Fees Loan",
  "62121001": "Hire Purchase",
  "62131001": "Quick Cash Loan",
  "62141001": "Land Loan",
  "62161001": "Car Loan",
};

export const SAVINGS_ACCOUNT_NAMES: Record<string, string> = {
  "63101001": "Members Savings",
  "62131001": "Quick Cash Accounts",
};

/** Loan statuses that carry an outstanding balance owed to the fund. */
export const ACTIVE_LOAN_STATUSES = ["active", "approved", "disbursed", "repaying"] as const;

/** Every status representing a loan that exists on the books (excludes pending/rejected). */
export const RECORDED_LOAN_STATUSES = [...ACTIVE_LOAN_STATUSES, "completed", "paid"] as const;

export function loanProductCode(
  product: { name?: string | null; account_code?: string | null } | null | undefined
): string {
  return product?.account_code ?? LOAN_PRODUCT_CODES[product?.name ?? ""] ?? LOAN_PRODUCT_CODES["Normal Loan"];
}

export function isActiveLoanStatus(status: string | null | undefined): boolean {
  return (ACTIVE_LOAN_STATUSES as readonly string[]).includes(status ?? "");
}

export function savingsAccountCode(row: {
  account_code?: string | null;
  account_number?: string | null;
}): string {
  if (row.account_code) return row.account_code;
  const prefix = (row.account_number ?? "").slice(0, 8);
  return /^\d{8}$/.test(prefix) ? prefix : GL.membersSavings;
}
