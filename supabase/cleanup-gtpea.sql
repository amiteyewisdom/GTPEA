-- =============================================================================
-- GTPEA — Full Cleanup
-- Removes all GTPEA tables, types, triggers, functions, policies, and the
-- test users seeded by create-test-users.sql.
-- Run in the Supabase SQL Editor of the project you want to clean.
-- WARNING: This will delete any data that is stored in the GTPEA tables.
-- =============================================================================

-- ── 1. Remove seeded test users (profiles cascade via ON DELETE CASCADE) ──────
DELETE FROM auth.users
WHERE email IN (
  'superadmin@gtpea.com',
  'admin@gtpea.com',
  'chairperson@gtpea.com',
  'fundmanager@gtpea.com',
  'unionrep@gtpea.com',
  'employee1@gtpea.com',
  'employee2@gtpea.com'
);

-- ── 2. Drop triggers ───────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS guard_profiles_protected_columns_trigger ON profiles;
DROP TRIGGER IF EXISTS set_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS set_savings_updated_at ON savings;
DROP TRIGGER IF EXISTS set_loan_products_updated_at ON loan_products;
DROP TRIGGER IF EXISTS set_loans_updated_at ON loans;
DROP TRIGGER IF EXISTS set_repayments_updated_at ON repayments;
DROP TRIGGER IF EXISTS set_approvals_updated_at ON approvals;
DROP TRIGGER IF EXISTS set_beneficiaries_updated_at ON beneficiaries;
DROP TRIGGER IF EXISTS set_withdrawal_requests_updated_at ON withdrawal_requests;
DROP TRIGGER IF EXISTS set_dividend_configs_updated_at ON dividend_configs;
DROP TRIGGER IF EXISTS set_statement_requests_updated_at ON statement_requests;

-- ── 3. Drop functions ──────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS guard_profiles_protected_columns() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;
DROP FUNCTION IF EXISTS current_employee_id() CASCADE;

-- ── 4. Drop tables (CASCADE handles foreign-key dependencies) ─────────────────
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS login_audit_logs CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS statement_requests CASCADE;
DROP TABLE IF EXISTS dividends CASCADE;
DROP TABLE IF EXISTS dividend_configs CASCADE;
DROP TABLE IF EXISTS loan_amortization_schedules CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS savings_adjustments CASCADE;
DROP TABLE IF EXISTS savings_contributions CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payroll_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS approval_actions CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loan_guarantors CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS loan_products CASCADE;
DROP TABLE IF EXISTS savings CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ── 5. Drop custom types ─────────────────────────────────────────────────────
DROP TYPE IF EXISTS approval_entity_type CASCADE;
DROP TYPE IF EXISTS approval_stage_role CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS beneficiary_relation CASCADE;
DROP TYPE IF EXISTS department CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS interest_method CASCADE;
DROP TYPE IF EXISTS ledger_account_type CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS repayment_status CASCADE;
DROP TYPE IF EXISTS savings_status CASCADE;
DROP TYPE IF EXISTS savings_type CASCADE;
DROP TYPE IF EXISTS statement_status CASCADE;
DROP TYPE IF EXISTS statement_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS withdrawal_status CASCADE;

-- ── Verify cleanup ────────────────────────────────────────────────────────────
SELECT 'cleanup complete' AS status;
