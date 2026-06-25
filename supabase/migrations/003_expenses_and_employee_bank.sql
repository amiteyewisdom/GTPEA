-- Migration: Add expenses table and extend employees with bank/savings fields

-- ============================================================
-- 1. EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  expense_date  DATE NOT NULL,
  description   TEXT,
  paid_to       TEXT,
  receipt_ref   TEXT,
  recorded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Fund manager and above can read/insert/delete expenses
CREATE POLICY "Staff can manage expenses"
  ON public.expenses
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid())
    IN ('fund_manager', 'administrator', 'super_admin', 'chairperson')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid())
    IN ('fund_manager', 'administrator', 'super_admin', 'chairperson')
  );

-- ============================================================
-- 2. EXTEND EMPLOYEES TABLE WITH BANKING & SAVINGS FIELDS
-- ============================================================
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS bank_branch    TEXT,
  ADD COLUMN IF NOT EXISTS sort_code      TEXT,
  ADD COLUMN IF NOT EXISTS monthly_savings NUMERIC(15,2) DEFAULT 0;

-- Note: bank_name and bank_account_no already exist in the schema.
-- This migration only adds the missing columns.
