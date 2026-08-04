-- =============================================================================
-- GTPEA — Partial Cleanup (for a project where only some GTPEA objects landed)
-- Use this when the GTPEA tables were NOT created but GTPEA policies,
-- triggers, or functions were applied and conflict with the live app.
-- =============================================================================

-- ── 1. Remove any test auth users that might remain ───────────────────────────
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

-- ── 2. Remove the GTPEA auto-create-profile trigger from auth.users ───────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ── 3. Remove GTPEA RLS policies from audit_logs ──────────────────────────────
-- If audit_logs existed in the project before the accident, these policies were
-- added by schema.sql and can restrict the live app.
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- ── 4. Disable RLS on audit_logs ONLY if the live app was not using RLS before ─
-- IMPORTANT: If the live app intentionally used RLS on audit_logs, do NOT run
-- the line below. Check first with:
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'audit_logs';
-- If relrowsecurity was true BEFORE the accident, leave RLS enabled.
-- If you are sure the live app did NOT use RLS on audit_logs, uncomment the next line:
-- ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- ── 5. Remove GTPEA-specific functions that are now invalid/useless here ───────
-- These reference the profiles table, which doesn't exist in this project.
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS guard_profiles_protected_columns() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;
DROP FUNCTION IF EXISTS current_employee_id() CASCADE;

-- NOTE: handle_updated_at() is intentionally NOT dropped because it is a
-- generic helper that the live app may already be using. If you are sure it is
-- unused here, you can drop it manually with:
--   DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

SELECT 'partial cleanup complete' AS status;
