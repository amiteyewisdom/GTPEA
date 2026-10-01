-- =============================================================================
-- Restore loan_status values + backfill GL account codes
-- Run in Supabase SQL Editor. Safe to re-run (all statements idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. loan_status: 'add_gtpea_departments.sql' rebuilt the enum for the Excel
--    import and dropped 'disbursed' / 'repaying'. The app still writes those
--    statuses (loan disbursement, payroll master-file recovery), and reports
--    filter on them — without them every such query errors out.
-- -----------------------------------------------------------------------------
ALTER TYPE loan_status ADD VALUE IF NOT EXISTS 'disbursed';
ALTER TYPE loan_status ADD VALUE IF NOT EXISTS 'repaying';

-- transaction_type on live is a reduced set (interest, fee, ...) vs schema.sql.
-- Restore the schema's values so charges/penalty and interest-credit writes work.
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'penalty';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'interest_credit';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'dividend_credit';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'savings_adjustment';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'withdrawal_disbursement';

-- -----------------------------------------------------------------------------
-- 2. savings.account_code — added by 20260612000000_gtpea_corrections.sql but
--    missing on databases where that migration was not run.
-- -----------------------------------------------------------------------------
ALTER TABLE savings ADD COLUMN IF NOT EXISTS account_code TEXT;

-- -----------------------------------------------------------------------------
-- 3. Backfill loan_products.account_code.
--    Codes follow the convention already used by imported member account
--    numbers, e.g. 62101001P0770 = GL code 62101001 + staff ID P0770.
-- -----------------------------------------------------------------------------
UPDATE loan_products SET account_code = '62101001' WHERE name = 'Normal Loan'  AND account_code IS NULL;
UPDATE loan_products SET account_code = '62111001' WHERE name = 'School Fees'  AND account_code IS NULL;
UPDATE loan_products SET account_code = '62121001' WHERE name = 'Hire Purchase' AND account_code IS NULL;
UPDATE loan_products SET account_code = '62131001' WHERE name = 'Quick Cash'    AND account_code IS NULL;
UPDATE loan_products SET account_code = '62141001' WHERE name IN ('Land', 'Land Loan') AND account_code IS NULL;
UPDATE loan_products SET account_code = '62161001' WHERE name = 'Car Loan'      AND account_code IS NULL;

-- -----------------------------------------------------------------------------
-- 4. Backfill savings.account_code from the account number prefix
--    (first 8 digits when numeric), defaulting to the members-savings code.
-- -----------------------------------------------------------------------------
UPDATE savings
SET account_code = left(account_number, 8)
WHERE account_code IS NULL
  AND account_number ~ '^\d{8}';

UPDATE savings
SET account_code = '63101001'
WHERE account_code IS NULL;

-- -----------------------------------------------------------------------------
-- 5. calculate_max_borrowable() references 'disbursed'/'repaying' but not the
--    'active' status used by imported and newly approved loans.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_max_borrowable(p_employee_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_savings_balance   NUMERIC := 0;
  v_loan_balance      NUMERIC := 0;
  v_max_borrowable    NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(balance), 0) INTO v_savings_balance
  FROM savings
  WHERE employee_id = p_employee_id AND status = 'active';

  SELECT COALESCE(SUM(outstanding_balance), 0) INTO v_loan_balance
  FROM loans
  WHERE employee_id = p_employee_id
    AND status IN ('approved', 'active', 'disbursed', 'repaying');

  v_max_borrowable := (v_savings_balance * 3) - v_loan_balance;
  RETURN GREATEST(v_max_borrowable, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
