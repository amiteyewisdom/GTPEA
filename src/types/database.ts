export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "super_admin" | "administrator" | "employee" | "fund_manager" | "chairperson" | "chairman" | "union_rep";
export type EmployeeStatus = "active" | "inactive" | "suspended" | "terminated";
export type LoanStatus = "pending" | "approved" | "disbursed" | "repaying" | "completed" | "rejected" | "defaulted";
export type SavingsType = "regular" | "special" | "emergency" | "retirement";
export type SavingsStatus = "active" | "frozen" | "closed" | "suspended";
export type ApprovalStatus     = "pending" | "approved" | "rejected" | "escalated" | "on_hold";
export type ApprovalEntityType = "loan" | "withdrawal" | "savings_adjustment" | "employee_onboarding" | "dividend";
export type ApprovalStageRole  = "union_rep" | "fund_manager" | "chairperson" | "chairman";
export type TransactionType    = "savings_deposit" | "savings_withdrawal" | "savings_adjustment" | "loan_disbursement" | "loan_repayment" | "withdrawal_disbursement" | "dividend_credit" | "interest_credit" | "transfer" | "fee" | "penalty";
export type RepaymentStatus    = "pending" | "paid" | "overdue" | "partial" | "waived";
export type Department         = "management" | "finance" | "operations" | "hr" | "it" | "sales" | "legal" | "audit";
export type WithdrawalStatus   = "pending" | "under_review" | "approved" | "rejected" | "disbursed" | "on_hold";
export type InterestMethod     = "flat_rate" | "reducing_balance";
export type BeneficiaryRelation = "spouse" | "child" | "parent" | "sibling" | "other";
export type StatementStatus    = "pending" | "processing" | "ready" | "downloaded";
export type StatementType      = "savings" | "loan" | "dividend" | "full_account";
export type LedgerAccountType  = "savings" | "loan" | "loan_repayment" | "withdrawal" | "interest" | "dividend" | "penalty" | "fee";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          employee_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          employee_no: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          department: Department;
          position: string;
          status: EmployeeStatus;
          date_joined: string;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          salary: number;
          bank_name: string | null;
          bank_account_no: string | null;
          bvn: string | null;
          nin: string | null;
          next_of_kin_name: string | null;
          next_of_kin_phone: string | null;
          next_of_kin_relationship: string | null;
          address: string | null;
          avatar_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      savings: {
        Row: {
          id: string;
          employee_id: string;
          type: SavingsType;
          status: SavingsStatus;
          balance: number;
          interest_rate: number;
          monthly_contribution: number;
          target_amount: number | null;
          maturity_date: string | null;
          account_number: string;
          opened_at: string;
          closed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["savings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["savings"]["Insert"]>;
      };
      loan_products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          interest_rate: number;
          min_amount: number;
          max_amount: number;
          min_term_months: number;
          max_term_months: number;
          processing_fee_percent: number;
          requires_guarantor: boolean;
          max_loan_to_salary_ratio: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loan_products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["loan_products"]["Insert"]>;
      };
      loans: {
        Row: {
          id: string;
          loan_ref: string;
          employee_id: string;
          loan_product_id: string;
          amount_requested: number;
          amount_approved: number | null;
          amount_disbursed: number | null;
          outstanding_balance: number;
          interest_rate: number;
          processing_fee: number;
          term_months: number;
          monthly_repayment: number;
          status: LoanStatus;
          purpose: string | null;
          disbursement_date: string | null;
          expected_completion_date: string | null;
          actual_completion_date: string | null;
          guarantor_id: string | null;
          approved_by: string | null;
          disbursed_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loans"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["loans"]["Insert"]>;
      };
      repayments: {
        Row: {
          id: string;
          loan_id: string;
          employee_id: string;
          installment_no: number;
          amount_due: number;
          amount_paid: number;
          principal_component: number;
          interest_component: number;
          due_date: string;
          paid_date: string | null;
          status: RepaymentStatus;
          payment_method: string | null;
          reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["repayments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["repayments"]["Insert"]>;
      };
      approvals: {
        Row: {
          id: string;
          entity_type: ApprovalEntityType;
          entity_id: string;
          status: ApprovalStatus;
          submitted_by: string;
          reviewed_by: string | null;
          review_notes: string | null;
          escalated_to: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["approvals"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["approvals"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          reference: string;
          employee_id: string;
          type: TransactionType;
          amount: number;
          balance_before: number;
          balance_after: number;
          description: string;
          related_id: string | null;
          related_type: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at">;
        Update: never;
      };
      payroll_logs: {
        Row: {
          id: string;
          employee_id: string;
          period_year: number;
          period_month: number;
          gross_salary: number;
          loan_deduction: number;
          savings_deduction: number;
          tax_deduction: number;
          other_deductions: number;
          net_salary: number;
          processed_by: string | null;
          processed_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payroll_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values: Json | null;
          new_values: Json | null;
          performed_by: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      approval_actions: {
        Row: {
          id: string;
          approval_id: string;
          stage: number;
          required_role: ApprovalStageRole;
          action: ApprovalStatus;
          actioned_by: string | null;
          notes: string | null;
          actioned_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["approval_actions"]["Row"], "id" | "actioned_at">;
        Update: never;
      };
      beneficiaries: {
        Row: {
          id: string;
          employee_id: string;
          full_name: string;
          relationship: BeneficiaryRelation;
          phone: string | null;
          email: string | null;
          id_number: string | null;
          allocation_pct: number;
          is_primary: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["beneficiaries"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["beneficiaries"]["Insert"]>;
      };
      savings_contributions: {
        Row: {
          id: string;
          savings_id: string;
          employee_id: string;
          amount: number;
          contribution_type: "monthly" | "voluntary" | "adjustment";
          period_year: number;
          period_month: number;
          narration: string | null;
          reference: string;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["savings_contributions"]["Row"], "id" | "created_at">;
        Update: never;
      };
      savings_adjustments: {
        Row: {
          id: string;
          savings_id: string;
          employee_id: string;
          amount: number;
          reason: string;
          reference: string;
          approved_by: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["savings_adjustments"]["Row"], "id" | "created_at">;
        Update: never;
      };
      withdrawal_requests: {
        Row: {
          id: string;
          request_ref: string;
          employee_id: string;
          savings_id: string;
          amount: number;
          reason: string | null;
          status: WithdrawalStatus;
          requested_at: string;
          disbursement_date: string | null;
          disbursed_by: string | null;
          bank_name: string | null;
          bank_account_no: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["withdrawal_requests"]["Row"], "id" | "created_at" | "updated_at" | "requested_at">;
        Update: Partial<Database["public"]["Tables"]["withdrawal_requests"]["Insert"]>;
      };
      loan_amortization_schedules: {
        Row: {
          id: string;
          loan_id: string;
          installment_no: number;
          due_date: string;
          opening_balance: number;
          principal_amount: number;
          interest_amount: number;
          total_payment: number;
          closing_balance: number;
          is_paid: boolean;
          paid_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loan_amortization_schedules"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["loan_amortization_schedules"]["Row"], "is_paid" | "paid_date">>;
      };
      dividend_configs: {
        Row: {
          id: string;
          fiscal_year: number;
          rate_percent: number;
          basis: "average_savings" | "year_end_balance" | "shares";
          total_pool: number | null;
          status: "draft" | "approved" | "distributed";
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dividend_configs"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["dividend_configs"]["Insert"]>;
      };
      dividends: {
        Row: {
          id: string;
          dividend_config_id: string;
          employee_id: string;
          savings_id: string | null;
          fiscal_year: number;
          average_balance: number;
          rate_percent: number;
          dividend_amount: number;
          credited_at: string | null;
          reference: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dividends"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["dividends"]["Row"], "credited_at" | "notes">>;
      };
      statement_requests: {
        Row: {
          id: string;
          employee_id: string;
          type: StatementType;
          date_from: string;
          date_to: string;
          status: StatementStatus;
          requested_at: string;
          processed_by: string | null;
          processed_at: string | null;
          file_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["statement_requests"]["Row"], "id" | "created_at" | "updated_at" | "requested_at">;
        Update: Partial<Database["public"]["Tables"]["statement_requests"]["Insert"]>;
      };
      ledger_entries: {
        Row: {
          id: string;
          account_type: LedgerAccountType;
          transaction_id: string | null;
          employee_id: string | null;
          debit: number;
          credit: number;
          running_balance: number;
          narration: string;
          reference: string;
          period_year: number;
          period_month: number;
          posted_by: string | null;
          posted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ledger_entries"]["Row"], "id" | "posted_at">;
        Update: never;
      };
      login_audit_logs: {
        Row: {
          id: string;
          user_id: string;
          event: "login" | "logout" | "failed_login" | "password_reset" | "session_expired";
          ip_address: string | null;
          user_agent: string | null;
          device: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["login_audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: { Args: Record<string, never>; Returns: UserRole };
      current_employee_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: {
      user_role: UserRole;
      employee_status: EmployeeStatus;
      loan_status: LoanStatus;
      savings_type: SavingsType;
      savings_status: SavingsStatus;
      approval_status: ApprovalStatus;
      approval_stage_role: ApprovalStageRole;
      transaction_type: TransactionType;
      repayment_status: RepaymentStatus;
      withdrawal_status: WithdrawalStatus;
      interest_method: InterestMethod;
      beneficiary_relation: BeneficiaryRelation;
      statement_status: StatementStatus;
      statement_type: StatementType;
      ledger_account_type: LedgerAccountType;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Employee = Tables<"employees">;
export type Savings = Tables<"savings">;
export type LoanProduct = Tables<"loan_products">;
export type Loan = Tables<"loans">;
export type Repayment = Tables<"repayments">;
export type Approval = Tables<"approvals">;
export type ApprovalAction = Tables<"approval_actions">;
export type Transaction = Tables<"transactions">;
export type PayrollLog = Tables<"payroll_logs">;
export type AuditLog = Tables<"audit_logs">;
export type Beneficiary = Tables<"beneficiaries">;
export type SavingsContribution = Tables<"savings_contributions">;
export type SavingsAdjustment = Tables<"savings_adjustments">;
export type WithdrawalRequest = Tables<"withdrawal_requests">;
export type LoanAmortizationSchedule = Tables<"loan_amortization_schedules">;
export type DividendConfig = Tables<"dividend_configs">;
export type Dividend = Tables<"dividends">;
export type StatementRequest = Tables<"statement_requests">;
export type LedgerEntry = Tables<"ledger_entries">;
export type LoginAuditLog = Tables<"login_audit_logs">;
