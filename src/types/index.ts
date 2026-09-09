// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'administrator' | 'admin' | 'employee' | 'fund_manager' | 'chairperson' | 'chairman' | 'union_rep';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  employee_id?: string;
  full_name: string;
  avatar_url?: string;
}

// ─── Employee ─────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  basic_salary: number;
  is_active: boolean;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

// ─── Savings ──────────────────────────────────────────────────────────────────

export type SavingsTransactionType = 'deposit' | 'withdrawal';

export interface SavingsAccount {
  id: string;
  employee_id: string;
  account_number: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employee?: Pick<Employee, 'full_name' | 'employee_id' | 'department'>;
}

export interface SavingsTransaction {
  id: string;
  savings_account_id: string;
  type: SavingsTransactionType;
  amount: number;
  balance_after: number;
  reference: string;
  narration?: string;
  created_by: string;
  created_at: string;
}

// ─── Loans ────────────────────────────────────────────────────────────────────

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'completed' | 'defaulted';

export interface LoanProduct {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  max_tenure_months: number;
  is_active: boolean;
  created_at: string;
}

export interface Loan {
  id: string;
  loan_number: string;
  employee_id: string;
  loan_product_id: string;
  amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_repayment: number;
  total_repayable: number;
  amount_paid: number;
  outstanding_balance: number;
  status: LoanStatus;
  disbursed_at?: string;
  next_repayment_date?: string;
  created_at: string;
  updated_at: string;
  employee?: Pick<Employee, 'full_name' | 'employee_id' | 'department'>;
  loan_product?: Pick<LoanProduct, 'name' | 'interest_rate'>;
}

export interface Repayment {
  id: string;
  loan_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  narration?: string;
  created_by: string;
  created_at: string;
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'loan' | 'withdrawal';

export interface Approval {
  id: string;
  type: ApprovalType;
  reference_id: string;
  employee_id: string;
  amount: number;
  status: ApprovalStatus;
  requested_by: string;
  reviewed_by?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
  employee?: Pick<Employee, 'full_name' | 'employee_id'>;
}

// ─── Transactions & Audit ─────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: 'savings_deposit' | 'savings_withdrawal' | 'loan_disbursement' | 'loan_repayment';
  reference: string;
  employee_id: string;
  amount: number;
  narration?: string;
  created_by: string;
  created_at: string;
  employee?: Pick<Employee, 'full_name' | 'employee_id'>;
}

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  performed_by: string;
  created_at: string;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKPIs {
  total_employees: number;
  active_employees: number;
  total_savings: number;
  total_loans_outstanding: number;
  total_loans_disbursed: number;
  pending_approvals: number;
  total_repayments_this_month: number;
  loan_default_rate: number;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface TableColumn<T = Record<string, unknown>> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}
