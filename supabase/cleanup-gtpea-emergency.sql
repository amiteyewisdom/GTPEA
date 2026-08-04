-- =============================================================================
-- GTPEA — Emergency Cleanup (for a LIVE project where schema.sql and
-- create-test-users.sql were accidentally run)
--
-- This script does the MINIMUM safe cleanup to close the security hole and
-- stop GTPEA triggers from interfering with the live app. It does NOT drop
-- any tables, so existing live data in tables like profiles / employees /
-- loan_products is left untouched.
--
-- After running this, inspect the tables listed below. If they only contain
-- the GTPEA test data, you can run cleanup-gtpea.sql to fully remove them.
-- If they contain live data, do NOT drop them — restore from a backup instead.
-- =============================================================================

-- ── 1. Delete the test auth users created by create-test-users.sql ────────────
-- These accounts have the default password Gtpea@2025 and are a security risk.
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

-- ── 2. Remove the auto-create-profile trigger from auth.users ─────────────────
-- This prevents new live signups from getting an unwanted profiles row.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ── 3. Inspect row counts before deciding whether to drop tables ─────────────
-- This creates a temporary helper function so it can safely check each table's
-- existence before counting. If any of these tables contain live data that
-- predates the accident, do NOT run cleanup-gtpea.sql; restore from a backup.
CREATE OR REPLACE FUNCTION gtpea_table_counts()
RETURNS TABLE(table_name TEXT, row_count BIGINT) AS $$
DECLARE
  tables TEXT[] := ARRAY[
    'profiles','employees','loan_products','savings','loans','repayments',
    'approvals','approval_actions','transactions','payroll_logs','audit_logs',
    'beneficiaries','savings_contributions','savings_adjustments','withdrawal_requests',
    'loan_amortization_schedules','dividend_configs','dividends','statement_requests',
    'ledger_entries','login_audit_logs','notifications'
  ];
  t TEXT;
  cnt BIGINT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT COUNT(*) FROM %I', t) INTO cnt;
      table_name := t;
      row_count := cnt;
      RETURN NEXT;
    ELSE
      table_name := t;
      row_count := NULL;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM gtpea_table_counts() ORDER BY table_name;

DROP FUNCTION IF EXISTS gtpea_table_counts();
