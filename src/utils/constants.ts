import { UserRole } from '@/types';

export const APP_NAME = 'GTPEA';
export const APP_DESCRIPTION = 'Ghana Teachers & Public Employees Association — Finance Platform';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Administrator',
  administrator: 'Administrator',
  admin: 'Administrator',
  employee: 'Employee',
  fund_manager: 'Fund Manager',
  chairperson: 'Chairperson',
  chairman: 'Chairperson',
  union_rep: 'Union Representative',
};

export const LOAN_STATUS_COLORS = {
  pending: 'warning',
  approved: 'info',
  rejected: 'error',
  disbursed: 'primary',
  completed: 'success',
  defaulted: 'error',
} as const;

export const APPROVAL_STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
} as const;

export const DEPARTMENTS = [
  'Administration',
  'Finance',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Education',
  'Health Services',
  'Procurement',
  'Legal',
  'Other',
];

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

export const SUPABASE_TABLES = {
  EMPLOYEES: 'employees',
  SAVINGS_ACCOUNTS: 'savings_accounts',
  SAVINGS_TRANSACTIONS: 'savings_transactions',
  LOAN_PRODUCTS: 'loan_products',
  LOANS: 'loans',
  REPAYMENTS: 'repayments',
  APPROVALS: 'approvals',
  TRANSACTIONS: 'transactions',
  AUDIT_LOGS: 'audit_logs',
  PROFILES: 'profiles',
} as const;
