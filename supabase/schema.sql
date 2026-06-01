-- =============================================================================
-- GTPEA Finance Platform — Supabase Schema v2
-- Complete schema including all modules per project specification
-- Run this entire script in the Supabase SQL Editor (fresh database)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS  (idempotent — safe to re-run)
-- =============================================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin','employee','fund_manager','chairman','union_rep'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE employee_status AS ENUM ('active','inactive','suspended','terminated'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE department AS ENUM ('management','finance','operations','hr','it','sales','legal','audit'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE loan_status AS ENUM ('pending','approved','disbursed','repaying','completed','rejected','defaulted'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE savings_type AS ENUM ('regular','special','emergency','retirement'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE savings_status AS ENUM ('active','frozen','closed','suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','escalated','on_hold'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE approval_entity_type AS ENUM ('loan','withdrawal','savings_adjustment','employee_onboarding','dividend'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('savings_deposit','savings_withdrawal','savings_adjustment','loan_disbursement','loan_repayment','withdrawal_disbursement','dividend_credit','interest_credit','transfer','fee','penalty'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE repayment_status AS ENUM ('pending','paid','overdue','partial','waived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE withdrawal_status AS ENUM ('pending','under_review','approved','rejected','disbursed','on_hold'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE interest_method AS ENUM ('flat_rate','reducing_balance'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE beneficiary_relation AS ENUM ('spouse','child','parent','sibling','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE statement_status AS ENUM ('pending','processing','ready','downloaded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE statement_type AS ENUM ('savings','loan','dividend','full_account'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ledger_account_type AS ENUM ('savings','loan','loan_repayment','withdrawal','interest','dividend','penalty','fee'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE approval_stage_role AS ENUM ('union_rep','fund_manager','chairman'); EXCEPTION WHEN duplicate_object THEN null; END $$;
-- Add new role values to existing enums (safe for re-run)
DO $$ BEGIN ALTER TYPE user_role ADD VALUE 'super_admin'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE 'administrator'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE 'chairperson'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE approval_stage_role ADD VALUE 'chairperson'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 2. HELPER: updated_at trigger function
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles (linked 1-to-1 with Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'employee',
  avatar_url    TEXT,
  phone         TEXT,
  employee_id   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on new user signup (swallows errors so auth never blocks)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- employees
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no              TEXT NOT NULL UNIQUE,
  first_name               TEXT NOT NULL,
  last_name                TEXT NOT NULL,
  email                    TEXT NOT NULL UNIQUE,
  phone                    TEXT,
  department               department NOT NULL,
  position                 TEXT NOT NULL,
  status                   employee_status NOT NULL DEFAULT 'active',
  date_joined              DATE NOT NULL,
  date_of_birth            DATE,
  gender                   TEXT CHECK (gender IN ('male', 'female', 'other')),
  salary                   NUMERIC(15, 2) NOT NULL DEFAULT 0,
  bank_name                TEXT,
  bank_account_no          TEXT,
  bvn                      TEXT,
  nin                      TEXT,
  next_of_kin_name         TEXT,
  next_of_kin_phone        TEXT,
  next_of_kin_relationship TEXT,
  address                  TEXT,
  avatar_url               TEXT,
  created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_employees_updated_at ON employees;
CREATE TRIGGER set_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_employees_status     ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_email      ON employees(email);

-- -----------------------------------------------------------------------------
-- savings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id          UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  type                 savings_type NOT NULL DEFAULT 'regular',
  status               savings_status NOT NULL DEFAULT 'active',
  balance              NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_rate        NUMERIC(5, 4) NOT NULL DEFAULT 0,
  monthly_contribution NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_amount        NUMERIC(15, 2),
  maturity_date        DATE,
  account_number       TEXT NOT NULL UNIQUE,
  opened_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at            TIMESTAMPTZ,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_savings_updated_at ON savings;
CREATE TRIGGER set_savings_updated_at
  BEFORE UPDATE ON savings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_savings_employee_id ON savings(employee_id);
CREATE INDEX IF NOT EXISTS idx_savings_status      ON savings(status);

-- -----------------------------------------------------------------------------
-- loan_products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_products (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  description               TEXT,
  interest_rate             NUMERIC(5, 4) NOT NULL,
  min_amount                NUMERIC(15, 2) NOT NULL,
  max_amount                NUMERIC(15, 2) NOT NULL,
  min_term_months           INTEGER NOT NULL DEFAULT 1,
  max_term_months           INTEGER NOT NULL,
  processing_fee_percent    NUMERIC(5, 4) NOT NULL DEFAULT 0,
  interest_calc_method      interest_method NOT NULL DEFAULT 'reducing_balance',
  requires_guarantor        BOOLEAN NOT NULL DEFAULT FALSE,
  max_loan_to_salary_ratio  NUMERIC(5, 2) NOT NULL DEFAULT 3,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_by                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_loan_product_amounts CHECK (max_amount >= min_amount),
  CONSTRAINT chk_loan_product_terms   CHECK (max_term_months >= min_term_months)
);

-- Migration: add interest_calc_method if table was created before this column existed
ALTER TABLE loan_products
  ADD COLUMN IF NOT EXISTS interest_calc_method interest_method NOT NULL DEFAULT 'reducing_balance';

DROP TRIGGER IF EXISTS set_loan_products_updated_at ON loan_products;
CREATE TRIGGER set_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- -----------------------------------------------------------------------------
-- loans
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loans (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_ref                  TEXT NOT NULL UNIQUE,
  employee_id               UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  loan_product_id           UUID NOT NULL REFERENCES loan_products(id) ON DELETE RESTRICT,
  amount_requested          NUMERIC(15, 2) NOT NULL,
  amount_approved           NUMERIC(15, 2),
  amount_disbursed          NUMERIC(15, 2),
  outstanding_balance       NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_rate             NUMERIC(5, 4) NOT NULL,
  processing_fee            NUMERIC(15, 2) NOT NULL DEFAULT 0,
  term_months               INTEGER NOT NULL,
  monthly_repayment         NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status                    loan_status NOT NULL DEFAULT 'pending',
  purpose                   TEXT,
  disbursement_date         DATE,
  expected_completion_date  DATE,
  actual_completion_date    DATE,
  guarantor_id              UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  disbursed_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_loans_updated_at ON loans;
CREATE TRIGGER set_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_loans_employee_id ON loans(employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_status      ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_ref    ON loans(loan_ref);

-- -----------------------------------------------------------------------------
-- repayments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repayments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id             UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  installment_no      INTEGER NOT NULL,
  amount_due          NUMERIC(15, 2) NOT NULL,
  amount_paid         NUMERIC(15, 2) NOT NULL DEFAULT 0,
  principal_component NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_component  NUMERIC(15, 2) NOT NULL DEFAULT 0,
  due_date            DATE NOT NULL,
  paid_date           DATE,
  status              repayment_status NOT NULL DEFAULT 'pending',
  payment_method      TEXT,
  reference           TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, installment_no)
);

DROP TRIGGER IF EXISTS set_repayments_updated_at ON repayments;
CREATE TRIGGER set_repayments_updated_at
  BEFORE UPDATE ON repayments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_repayments_loan_id     ON repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_repayments_employee_id ON repayments(employee_id);
CREATE INDEX IF NOT EXISTS idx_repayments_due_date    ON repayments(due_date);
CREATE INDEX IF NOT EXISTS idx_repayments_status      ON repayments(status);

-- -----------------------------------------------------------------------------
-- approvals  (multi-stage workflow head record)
-- Loan workflow:  stage 1=union_rep → 2=fund_manager → 3=chairman
-- Withdrawal:     stage 1=union_rep → 2=fund_manager → 3=chairman
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     approval_entity_type NOT NULL,
  entity_id       UUID NOT NULL,
  status          approval_status NOT NULL DEFAULT 'pending',
  current_stage   SMALLINT NOT NULL DEFAULT 1,   -- 1, 2, or 3
  total_stages    SMALLINT NOT NULL DEFAULT 3,
  submitted_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  final_reviewer  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  final_notes     TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration: add multi-stage workflow columns if table was created before them
ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS current_stage SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_stages  SMALLINT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS completed_at   TIMESTAMPTZ;

DROP TRIGGER IF EXISTS set_approvals_updated_at ON approvals;
CREATE TRIGGER set_approvals_updated_at
  BEFORE UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_approvals_entity_id   ON approvals(entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status      ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_entity_type ON approvals(entity_type);

-- -----------------------------------------------------------------------------
-- approval_actions  (immutable — one row per stage action)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_actions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id  UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  stage        SMALLINT NOT NULL,
  required_role approval_stage_role NOT NULL,
  action       approval_status NOT NULL,   -- approved | rejected | on_hold | escalated
  actioned_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes        TEXT,
  actioned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (approval_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_approval_id ON approval_actions(approval_id);

-- -----------------------------------------------------------------------------
-- transactions  (immutable — no UPDATE allowed via app)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference     TEXT NOT NULL UNIQUE,
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  type          transaction_type NOT NULL,
  amount        NUMERIC(15, 2) NOT NULL,
  balance_before NUMERIC(15, 2) NOT NULL,
  balance_after  NUMERIC(15, 2) NOT NULL,
  description   TEXT NOT NULL,
  related_id    UUID,
  related_type  TEXT,
  performed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_employee_id ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type        ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at  ON transactions(created_at DESC);

-- -----------------------------------------------------------------------------
-- payroll_logs  (immutable)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  period_year       SMALLINT NOT NULL,
  period_month      SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  gross_salary      NUMERIC(15, 2) NOT NULL,
  loan_deduction    NUMERIC(15, 2) NOT NULL DEFAULT 0,
  savings_deduction NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_deduction     NUMERIC(15, 2) NOT NULL DEFAULT 0,
  other_deductions  NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net_salary        NUMERIC(15, 2) NOT NULL,
  processed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, period_year, period_month)
);

CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period      ON payroll_logs(period_year, period_month);

-- -----------------------------------------------------------------------------
-- audit_logs  (immutable)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action       TEXT NOT NULL,
  table_name   TEXT NOT NULL,
  record_id    UUID NOT NULL,
  old_values   JSONB,
  new_values   JSONB,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name  ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id   ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at DESC);

-- -----------------------------------------------------------------------------
-- beneficiaries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beneficiaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  relationship    beneficiary_relation NOT NULL,
  phone           TEXT,
  email           TEXT,
  id_number       TEXT,
  allocation_pct  NUMERIC(5, 2) NOT NULL DEFAULT 0
                  CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_beneficiaries_updated_at ON beneficiaries;
CREATE TRIGGER set_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_beneficiaries_employee_id ON beneficiaries(employee_id);

-- -----------------------------------------------------------------------------
-- savings_contributions  (monthly contribution ledger per savings account)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_id      UUID NOT NULL REFERENCES savings(id) ON DELETE RESTRICT,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  amount          NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  contribution_type TEXT NOT NULL DEFAULT 'monthly'
                  CHECK (contribution_type IN ('monthly', 'voluntary', 'adjustment')),
  period_year     SMALLINT NOT NULL,
  period_month    SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  narration       TEXT,
  reference       TEXT NOT NULL UNIQUE,
  recorded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_contributions_savings_id   ON savings_contributions(savings_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_employee_id  ON savings_contributions(employee_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_period       ON savings_contributions(period_year, period_month);

-- -----------------------------------------------------------------------------
-- savings_adjustments  (admin-initiated balance corrections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_adjustments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_id   UUID NOT NULL REFERENCES savings(id) ON DELETE RESTRICT,
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  amount       NUMERIC(15, 2) NOT NULL,   -- positive = credit, negative = debit
  reason       TEXT NOT NULL,
  reference    TEXT NOT NULL UNIQUE,
  approved_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_adjustments_savings_id ON savings_adjustments(savings_id);

-- -----------------------------------------------------------------------------
-- withdrawal_requests
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_ref     TEXT NOT NULL UNIQUE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  savings_id      UUID NOT NULL REFERENCES savings(id) ON DELETE RESTRICT,
  amount          NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  reason          TEXT,
  status          withdrawal_status NOT NULL DEFAULT 'pending',
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disbursement_date DATE,
  disbursed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bank_name       TEXT,
  bank_account_no TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER set_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_employee_id ON withdrawal_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status      ON withdrawal_requests(status);

-- -----------------------------------------------------------------------------
-- loan_amortization_schedules  (auto-generated after loan approval)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_amortization_schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id           UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  installment_no    INTEGER NOT NULL,
  due_date          DATE NOT NULL,
  opening_balance   NUMERIC(15, 2) NOT NULL,
  principal_amount  NUMERIC(15, 2) NOT NULL,
  interest_amount   NUMERIC(15, 2) NOT NULL,
  total_payment     NUMERIC(15, 2) NOT NULL,
  closing_balance   NUMERIC(15, 2) NOT NULL,
  is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
  paid_date         DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, installment_no)
);

CREATE INDEX IF NOT EXISTS idx_amortization_loan_id ON loan_amortization_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_amortization_due_date ON loan_amortization_schedules(due_date);

-- -----------------------------------------------------------------------------
-- dividend_configs  (admin configures yearly dividend rate)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dividend_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year     SMALLINT NOT NULL UNIQUE,
  rate_percent    NUMERIC(5, 2) NOT NULL CHECK (rate_percent >= 0 AND rate_percent <= 100),
  basis           TEXT NOT NULL DEFAULT 'average_savings'
                  CHECK (basis IN ('average_savings', 'year_end_balance', 'shares')),
  total_pool      NUMERIC(15, 2),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'distributed')),
  approved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_dividend_configs_updated_at ON dividend_configs;
CREATE TRIGGER set_dividend_configs_updated_at
  BEFORE UPDATE ON dividend_configs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- -----------------------------------------------------------------------------
-- dividends  (individual member dividend records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dividends (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dividend_config_id  UUID NOT NULL REFERENCES dividend_configs(id) ON DELETE RESTRICT,
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  savings_id          UUID REFERENCES savings(id) ON DELETE SET NULL,
  fiscal_year         SMALLINT NOT NULL,
  average_balance     NUMERIC(15, 2) NOT NULL DEFAULT 0,
  rate_percent        NUMERIC(5, 2) NOT NULL,
  dividend_amount     NUMERIC(15, 2) NOT NULL,
  credited_at         TIMESTAMPTZ,
  reference           TEXT NOT NULL UNIQUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dividend_config_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_dividends_employee_id        ON dividends(employee_id);
CREATE INDEX IF NOT EXISTS idx_dividends_dividend_config_id ON dividends(dividend_config_id);
CREATE INDEX IF NOT EXISTS idx_dividends_fiscal_year        ON dividends(fiscal_year);

-- -----------------------------------------------------------------------------
-- statement_requests
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statement_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  type            statement_type NOT NULL,
  date_from       DATE NOT NULL,
  date_to         DATE NOT NULL,
  status          statement_status NOT NULL DEFAULT 'pending',
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at    TIMESTAMPTZ,
  file_url        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_statement_requests_updated_at ON statement_requests;
CREATE TRIGGER set_statement_requests_updated_at
  BEFORE UPDATE ON statement_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_statement_requests_employee_id ON statement_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_statement_requests_status      ON statement_requests(status);

-- -----------------------------------------------------------------------------
-- ledger_entries  (double-entry; every financial transaction posts here)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type     ledger_account_type NOT NULL,
  transaction_id   UUID REFERENCES transactions(id) ON DELETE SET NULL,
  employee_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
  debit            NUMERIC(15, 2) NOT NULL DEFAULT 0,
  credit           NUMERIC(15, 2) NOT NULL DEFAULT 0,
  running_balance  NUMERIC(15, 2) NOT NULL DEFAULT 0,
  narration        TEXT NOT NULL,
  reference        TEXT NOT NULL,
  period_year      SMALLINT NOT NULL,
  period_month     SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  posted_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  posted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_type  ON ledger_entries(account_type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_employee_id   ON ledger_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_period        ON ledger_entries(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_posted_at     ON ledger_entries(posted_at DESC);

-- -----------------------------------------------------------------------------
-- login_audit_logs  (tracks every login/logout event)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event        TEXT NOT NULL CHECK (event IN ('login', 'logout', 'failed_login', 'password_reset', 'session_expired')),
  ip_address   INET,
  user_agent   TEXT,
  device       TEXT,
  location     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_audit_user_id    ON login_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_audit_event      ON login_audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_login_audit_created_at ON login_audit_logs(created_at DESC);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_actions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries              ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_adjustments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_amortization_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_configs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE statement_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries             ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_audit_logs           ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role (returns TEXT to avoid enum txn-safety issues)
DROP FUNCTION IF EXISTS current_user_role() CASCADE;
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user's employee_id (text)
CREATE OR REPLACE FUNCTION current_employee_id()
RETURNS TEXT AS $$
  SELECT employee_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── profiles ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL USING (current_user_role() IN ('super_admin', 'administrator'));

-- ── employees ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view employees" ON employees;
CREATE POLICY "Staff can view employees"
  ON employees FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own record" ON employees;
CREATE POLICY "Employees can view own record"
  ON employees FOR SELECT
  USING (employee_no = current_employee_id());

DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (current_user_role() IN ('super_admin', 'administrator'));

DROP POLICY IF EXISTS "Admins can update employees" ON employees;
CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (current_user_role() IN ('super_admin', 'administrator'));

-- ── savings ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all savings" ON savings;
CREATE POLICY "Staff can view all savings"
  ON savings FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own savings" ON savings;
CREATE POLICY "Employees can view own savings"
  ON savings FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Admins and fund managers can manage savings" ON savings;
CREATE POLICY "Admins and fund managers can manage savings"
  ON savings FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── loan_products ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "All authenticated users can view active loan products" ON loan_products;
CREATE POLICY "All authenticated users can view active loan products"
  ON loan_products FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage loan products" ON loan_products;
CREATE POLICY "Admins can manage loan products"
  ON loan_products FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator'));

-- ── loans ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all loans" ON loans;
CREATE POLICY "Staff can view all loans"
  ON loans FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own loans" ON loans;
CREATE POLICY "Employees can view own loans"
  ON loans FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Employees can apply for loans" ON loans;
CREATE POLICY "Employees can apply for loans"
  ON loans FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Admins and fund managers can update loans" ON loans;
CREATE POLICY "Admins and fund managers can update loans"
  ON loans FOR UPDATE
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── repayments ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all repayments" ON repayments;
CREATE POLICY "Staff can view all repayments"
  ON repayments FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own repayments" ON repayments;
CREATE POLICY "Employees can view own repayments"
  ON repayments FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Admins and fund managers can manage repayments" ON repayments;
CREATE POLICY "Admins and fund managers can manage repayments"
  ON repayments FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── approvals ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all approvals" ON approvals;
CREATE POLICY "Staff can view all approvals"
  ON approvals FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Users can view own submitted approvals" ON approvals;
CREATE POLICY "Users can view own submitted approvals"
  ON approvals FOR SELECT
  USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Admins and approvers can manage approvals" ON approvals;
CREATE POLICY "Admins and approvers can manage approvals"
  ON approvals FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson'));

-- ── transactions ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all transactions" ON transactions;
CREATE POLICY "Staff can view all transactions"
  ON transactions FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own transactions" ON transactions;
CREATE POLICY "Employees can view own transactions"
  ON transactions FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Admins and fund managers can insert transactions" ON transactions;
CREATE POLICY "Admins and fund managers can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── payroll_logs ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all payroll logs" ON payroll_logs;
CREATE POLICY "Staff can view all payroll logs"
  ON payroll_logs FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson'));

DROP POLICY IF EXISTS "Employees can view own payroll logs" ON payroll_logs;
CREATE POLICY "Employees can view own payroll logs"
  ON payroll_logs FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "Admins can insert payroll logs" ON payroll_logs;
CREATE POLICY "Admins can insert payroll logs"
  ON payroll_logs FOR INSERT
  WITH CHECK (current_user_role() IN ('super_admin', 'administrator'));

-- ── audit_logs ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'chairperson'));

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── approval_actions ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view approval actions" ON approval_actions;
CREATE POLICY "Staff can view approval actions"
  ON approval_actions FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Users can view own approval actions" ON approval_actions;
CREATE POLICY "Users can view own approval actions"
  ON approval_actions FOR SELECT
  USING (actioned_by = auth.uid());

DROP POLICY IF EXISTS "Approvers can insert approval actions" ON approval_actions;
CREATE POLICY "Approvers can insert approval actions"
  ON approval_actions FOR INSERT
  WITH CHECK (current_user_role() IN ('fund_manager', 'chairperson', 'union_rep'));

-- ── beneficiaries ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all beneficiaries" ON beneficiaries;
CREATE POLICY "Staff can view all beneficiaries"
  ON beneficiaries FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson'));

DROP POLICY IF EXISTS "Employees can manage own beneficiaries" ON beneficiaries;
CREATE POLICY "Employees can manage own beneficiaries"
  ON beneficiaries FOR ALL
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

-- ── savings_contributions ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view savings contributions" ON savings_contributions;
CREATE POLICY "Staff can view savings contributions"
  ON savings_contributions FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own contributions" ON savings_contributions;
CREATE POLICY "Employees can view own contributions"
  ON savings_contributions FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "Admin and fund managers can manage contributions" ON savings_contributions;
CREATE POLICY "Admin and fund managers can manage contributions"
  ON savings_contributions FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── savings_adjustments ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view savings adjustments" ON savings_adjustments;
CREATE POLICY "Staff can view savings adjustments"
  ON savings_adjustments FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson'));

DROP POLICY IF EXISTS "Admins and fund managers can manage adjustments" ON savings_adjustments;
CREATE POLICY "Admins and fund managers can manage adjustments"
  ON savings_adjustments FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── withdrawal_requests ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all withdrawals" ON withdrawal_requests;
CREATE POLICY "Staff can view all withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Employees can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "Employees can submit withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Employees can submit withdrawal requests"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "Fund managers and chairman can update withdrawals" ON withdrawal_requests;
CREATE POLICY "Fund managers and chairman can update withdrawals"
  ON withdrawal_requests FOR UPDATE
  USING (current_user_role() IN ('fund_manager', 'chairperson', 'super_admin', 'administrator'));

-- ── loan_amortization_schedules ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view amortization schedules" ON loan_amortization_schedules;
CREATE POLICY "Staff can view amortization schedules"
  ON loan_amortization_schedules FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own loan schedules" ON loan_amortization_schedules;
CREATE POLICY "Employees can view own loan schedules"
  ON loan_amortization_schedules FOR SELECT
  USING (
    loan_id IN (
      SELECT l.id FROM loans l
      JOIN employees e ON l.employee_id = e.id
      WHERE e.employee_no = current_employee_id()
    )
  );

DROP POLICY IF EXISTS "System can manage amortization schedules" ON loan_amortization_schedules;
CREATE POLICY "System can manage amortization schedules"
  ON loan_amortization_schedules FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── dividend_configs ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view dividend configs" ON dividend_configs;
CREATE POLICY "Staff can view dividend configs"
  ON dividend_configs FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Fund managers can manage dividend configs" ON dividend_configs;
CREATE POLICY "Fund managers can manage dividend configs"
  ON dividend_configs FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── dividends ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all dividends" ON dividends;
CREATE POLICY "Staff can view all dividends"
  ON dividends FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own dividends" ON dividends;
CREATE POLICY "Employees can view own dividends"
  ON dividends FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "Admin and fund managers can manage dividends" ON dividends;
CREATE POLICY "Admin and fund managers can manage dividends"
  ON dividends FOR ALL
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── statement_requests ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view all statement requests" ON statement_requests;
CREATE POLICY "Staff can view all statement requests"
  ON statement_requests FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson'));

DROP POLICY IF EXISTS "Employees can manage own statement requests" ON statement_requests;
CREATE POLICY "Employees can manage own statement requests"
  ON statement_requests FOR ALL
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "Admin can process all statement requests" ON statement_requests;
CREATE POLICY "Admin can process all statement requests"
  ON statement_requests FOR UPDATE
  USING (current_user_role() IN ('super_admin', 'administrator'));

-- ── ledger_entries ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view ledger" ON ledger_entries;
CREATE POLICY "Staff can view ledger"
  ON ledger_entries FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'fund_manager', 'chairperson', 'union_rep'));

DROP POLICY IF EXISTS "Employees can view own ledger entries" ON ledger_entries;
CREATE POLICY "Employees can view own ledger entries"
  ON ledger_entries FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE employee_no = current_employee_id())
  );

DROP POLICY IF EXISTS "System can insert ledger entries" ON ledger_entries;
CREATE POLICY "System can insert ledger entries"
  ON ledger_entries FOR INSERT
  WITH CHECK (current_user_role() IN ('super_admin', 'administrator', 'fund_manager'));

-- ── login_audit_logs ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins and chairman can view login audit" ON login_audit_logs;
CREATE POLICY "Admins and chairman can view login audit"
  ON login_audit_logs FOR SELECT
  USING (current_user_role() IN ('super_admin', 'administrator', 'chairperson'));

DROP POLICY IF EXISTS "Users can view own login history" ON login_audit_logs;
CREATE POLICY "Users can view own login history"
  ON login_audit_logs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert login events" ON login_audit_logs;
CREATE POLICY "System can insert login events"
  ON login_audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 5. SEED: Default loan products (GHS amounts)
-- =============================================================================

INSERT INTO loan_products (name, description, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, processing_fee_percent, requires_guarantor, max_loan_to_salary_ratio)
VALUES
  ('Emergency Loan',   'Short-term emergency financial support', 0.05, 'flat_rate',         500,    5000,  1,  6,  0.01,  FALSE, 1),
  ('Regular Loan',     'Standard staff cooperative loan',        0.10, 'reducing_balance',  1000,  20000,  3,  24, 0.02,  FALSE, 3),
  ('Education Loan',   'For staff education and training',       0.08, 'reducing_balance',  1000,  10000,  6,  36, 0.015, TRUE,  2),
  ('Housing Loan',     'For housing and home improvement',       0.12, 'reducing_balance', 10000, 100000, 12,  60, 0.025, TRUE,  5),
  ('Business Loan',    'For staff business ventures',            0.15, 'reducing_balance',  2000,  50000,  6,  48, 0.03,  TRUE,  4)
ON CONFLICT DO NOTHING;
