-- =============================================================================
-- GTPEA — FULL NUCLEAR RESET
-- Wipes ALL data including auth users, profiles, employees, loans, savings.
-- Keeps schema intact. Re-seeds correct loan products only.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- Disable triggers to avoid cascade/FK issues during wipe
SET session_replication_role = 'replica';

-- ── Wipe all transactional data ───────────────────────────────────────────────
TRUNCATE TABLE approval_actions            CASCADE;
TRUNCATE TABLE approvals                   CASCADE;
TRUNCATE TABLE repayments                  CASCADE;
TRUNCATE TABLE loan_amortization_schedules CASCADE;
TRUNCATE TABLE transactions                CASCADE;
TRUNCATE TABLE savings_contributions       CASCADE;
TRUNCATE TABLE withdrawal_requests         CASCADE;
TRUNCATE TABLE loans                       CASCADE;
TRUNCATE TABLE savings                     CASCADE;
TRUNCATE TABLE notifications               CASCADE;
TRUNCATE TABLE audit_logs                  CASCADE;
TRUNCATE TABLE employees                   CASCADE;
TRUNCATE TABLE profiles                    CASCADE;
TRUNCATE TABLE loan_products               CASCADE;

-- ── Wipe all auth users (logins) ─────────────────────────────────────────────
DELETE FROM auth.users;

-- ── Re-enable triggers ────────────────────────────────────────────────────────
SET session_replication_role = 'origin';

-- ── Seed correct GTPEA loan products ─────────────────────────────────────────
INSERT INTO loan_products (name, description, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, processing_fee_percent, requires_guarantor, max_loan_to_salary_ratio, is_active)
VALUES
  ('Normal Loan',   'Standard reducing balance loan.',                              0.02,  'reducing_balance', 500,   100000, 1,  48, 0.00, FALSE, 3, TRUE),
  ('Hire Purchase', 'Fixed asset financing. Flat rate interest on full principal.', 0.025, 'flat_rate',        200,   50000,  1,  12, 0.00, FALSE, 2, TRUE),
  ('Quick Cash',    'Short-term emergency cash loan.',                              0.05,  'reducing_balance', 100,   5000,   1,  6,  0.00, FALSE, 1, TRUE),
  ('Land Loan',     'Land acquisition. Amortized over up to 4 years.',             0.02,  'reducing_balance', 1000,  200000, 1,  48, 0.00, FALSE, 3, TRUE),
  ('School Fees',   'Academic calendar aligned school fees loan.',                 0.025, 'flat_rate',        200,   20000,  1,  12, 0.00, FALSE, 2, TRUE),
  ('Car Loan',      'Vehicle purchase loan.',                                       0.02,  'reducing_balance', 5000,  150000, 12, 60, 0.00, TRUE,  4, TRUE);

-- ── Verify (all should be 0 except loan_products = 6) ────────────────────────
SELECT 'auth.users'    AS table_name, COUNT(*) FROM auth.users
UNION ALL SELECT 'profiles',          COUNT(*) FROM profiles
UNION ALL SELECT 'employees',         COUNT(*) FROM employees
UNION ALL SELECT 'loan_products',     COUNT(*) FROM loan_products
UNION ALL SELECT 'savings',           COUNT(*) FROM savings
UNION ALL SELECT 'loans',             COUNT(*) FROM loans
UNION ALL SELECT 'transactions',      COUNT(*) FROM transactions;
