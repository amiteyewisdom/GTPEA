-- =============================================================================
-- GTPEA Finance Platform — Corrections Migration
-- Run this in Supabase SQL Editor after the base schema
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fix approval_stage_role enum: add 'chairperson' (the app uses chairperson,
--    schema only had 'chairman')
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TYPE approval_stage_role ADD VALUE 'chairperson';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 2. Add account_code to loan_products
-- -----------------------------------------------------------------------------
ALTER TABLE loan_products ADD COLUMN IF NOT EXISTS account_code TEXT;
ALTER TABLE loan_products ADD COLUMN IF NOT EXISTS staff_id_prefix TEXT;

-- -----------------------------------------------------------------------------
-- 3. Add interest_calc_method to loans table (so each loan records its method)
-- -----------------------------------------------------------------------------
ALTER TABLE loans ADD COLUMN IF NOT EXISTS interest_calc_method interest_method NOT NULL DEFAULT 'reducing_balance';

-- -----------------------------------------------------------------------------
-- 4. Add account_code to savings
-- -----------------------------------------------------------------------------
ALTER TABLE savings ADD COLUMN IF NOT EXISTS account_code TEXT;

-- -----------------------------------------------------------------------------
-- 5. Add savings contribution lock fields
--    locked_from_month / locked_from_year: after April each year, changes blocked
-- -----------------------------------------------------------------------------
ALTER TABLE savings ADD COLUMN IF NOT EXISTS contribution_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE savings ADD COLUMN IF NOT EXISTS contribution_last_changed_month SMALLINT;
ALTER TABLE savings ADD COLUMN IF NOT EXISTS contribution_last_changed_year  SMALLINT;

-- -----------------------------------------------------------------------------
-- 6. Add max_borrowable_amount function
--    = 3x monthly savings balance, minus any active loan outstanding balance
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
    AND status IN ('approved', 'disbursed', 'repaying');

  v_max_borrowable := (v_savings_balance * 3) - v_loan_balance;
  RETURN GREATEST(v_max_borrowable, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 7. Remove old wrong seed loan products and insert correct GTPEA products
-- -----------------------------------------------------------------------------
DELETE FROM loan_products WHERE name IN (
  'Emergency Loan', 'Regular Loan', 'Education Loan',
  'Housing Loan', 'Business Loan'
);

INSERT INTO loan_products (
  name, description, interest_rate, interest_calc_method,
  min_amount, max_amount, min_term_months, max_term_months,
  processing_fee_percent, requires_guarantor, max_loan_to_salary_ratio,
  is_active, account_code
) VALUES
  (
    'Normal Loan',
    'Standard reducing balance loan. Interest calculated monthly on remaining principal.',
    0.02, 'reducing_balance',
    500, 100000, 1, 48,
    0.00, FALSE, 3,
    TRUE, '62101001'
  ),
  (
    'Hire Purchase',
    'Fixed asset financing. Flat rate interest calculated upfront on full principal, divided equally across term. Includes consumables (rice, oil, milo, milk, biscuits, electrical/gadgets).',
    0.025, 'flat_rate',
    200, 50000, 1, 12,
    0.00, FALSE, 2,
    TRUE, '62121001'
  ),
  (
    'Quick Cash',
    'Short-term emergency facility. 5% reducing balance monthly rate on remaining balance.',
    0.05, 'reducing_balance',
    100, 10000, 1, 6,
    0.00, FALSE, 1,
    TRUE, '62131001'
  ),
  (
    'Land',
    'Long-term property/land support. 2% reducing balance or full amortization over up to 4 years.',
    0.02, 'reducing_balance',
    1000, 500000, 6, 48,
    0.00, TRUE, 5,
    TRUE, '62141001'
  ),
  (
    'School Fees',
    'Targeted tuition support. Fixed repayment aligned to academic calendar (up to 4 months).',
    0.025, 'flat_rate',
    100, 30000, 1, 4,
    0.00, FALSE, 2,
    TRUE, '62111001'
  ),
  (
    'Car Loan',
    'Vehicle acquisition loan. Rates and terms set by fund manager.',
    0.02, 'reducing_balance',
    5000, 300000, 12, 60,
    0.00, TRUE, 4,
    TRUE, '62161001'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. Add consumables inventory table (for Hire Purchase consumables track)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumable_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('food', 'electrical', 'other')),
  unit_price   NUMERIC(15, 2) NOT NULL CHECK (unit_price > 0),
  unit         TEXT NOT NULL DEFAULT 'unit',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  account_code TEXT NOT NULL DEFAULT '61101001',
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_consumable_items_updated_at ON consumable_items;
CREATE TRIGGER set_consumable_items_updated_at
  BEFORE UPDATE ON consumable_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE consumable_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view consumable items" ON consumable_items;
CREATE POLICY "Staff can view consumable items"
  ON consumable_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage consumable items" ON consumable_items;
CREATE POLICY "Admins can manage consumable items"
  ON consumable_items FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- Seed default consumable items
INSERT INTO consumable_items (name, category, unit_price, unit, account_code) VALUES
  ('Rice (50kg bag)',     'food',       250.00, 'bag',    '61101001'),
  ('Cooking Oil (5L)',    'food',        85.00, 'bottle', '61101001'),
  ('Milo (400g)',         'food',        45.00, 'tin',    '61101001'),
  ('Milk (400g)',         'food',        38.00, 'tin',    '61101001'),
  ('Biscuits (assorted)', 'food',        25.00, 'pack',   '61101001'),
  ('Electrical Gadgets',  'electrical', 500.00, 'item',   '61101002')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. consumable_loan_items — tracks which items are in a hire purchase loan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumable_loan_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id      UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  item_id      UUID NOT NULL REFERENCES consumable_items(id) ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   NUMERIC(15, 2) NOT NULL,
  total_price  NUMERIC(15, 2) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE consumable_loan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view consumable loan items" ON consumable_loan_items;
CREATE POLICY "Staff can view consumable loan items"
  ON consumable_loan_items FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own consumable loan items" ON consumable_loan_items;
CREATE POLICY "Employees can view own consumable loan items"
  ON consumable_loan_items FOR SELECT
  USING (
    loan_id IN (
      SELECT l.id FROM loans l
      JOIN employees e ON l.employee_id = e.id
      WHERE e.employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "System can manage consumable loan items" ON consumable_loan_items;
CREATE POLICY "System can manage consumable loan items"
  ON consumable_loan_items FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- -----------------------------------------------------------------------------
-- 10. Add fiscal_year_start / fiscal_year_end awareness to dividend_configs
--     GTPEA fiscal year: December (year N) → November (year N+1)
-- -----------------------------------------------------------------------------
ALTER TABLE dividend_configs
  ADD COLUMN IF NOT EXISTS fiscal_year_start DATE,
  ADD COLUMN IF NOT EXISTS fiscal_year_end   DATE;

-- Update any existing rows to set fiscal period if not set
UPDATE dividend_configs
SET
  fiscal_year_start = make_date(fiscal_year::int, 12, 1),
  fiscal_year_end   = make_date(fiscal_year::int + 1, 11, 30)
WHERE fiscal_year_start IS NULL;

-- -----------------------------------------------------------------------------
-- 11. Add account_number generation function for new savings accounts
--     Format: SAV-<STAFFID>-<YEAR><SEQ>
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_savings_account_no(p_employee_no TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year   TEXT := to_char(NOW(), 'YY');
  v_seq    INT;
  v_accno  TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM savings s
  JOIN employees e ON s.employee_id = e.id
  WHERE e.employee_no = p_employee_no;

  v_accno := 'SAV-' || p_employee_no || '-' || v_year || LPAD(v_seq::TEXT, 3, '0');
  RETURN v_accno;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 12. RLS: employees can also submit approvals when role = 'employee'
--     (already handled but ensure union_rep can also submit for withdrawals)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Employees can submit approvals" ON approvals;
CREATE POLICY "Employees can submit approvals"
  ON approvals FOR INSERT
  WITH CHECK (submitted_by = auth.uid());
