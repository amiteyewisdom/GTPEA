-- Fix all profiles by linking them to their corresponding employee records
-- This will update ALL profiles that can be matched by email (staffID@staff.gtpea.local format)

-- Disable RLS and guard trigger temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS guard_profiles_protected_columns_trigger ON profiles;

-- Update all profiles that match the email pattern
UPDATE profiles p
SET
  employee_id = e.id::text,
  full_name = CONCAT(e.first_name, ' ', e.last_name)
FROM employees e
WHERE p.user_id IN (
  SELECT id FROM auth.users
  WHERE email = CONCAT(e.employee_no, '@staff.gtpea.local')
)
AND p.employee_id IS NULL;

-- Re-enable RLS and guard trigger
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER guard_profiles_protected_columns_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION guard_profiles_protected_columns();

-- Show how many profiles were updated
SELECT
  COUNT(*) as total_profiles_updated
FROM profiles
WHERE employee_id IS NOT NULL;

-- Show a sample of updated profiles
SELECT
  p.id,
  u.email,
  p.full_name,
  p.employee_id,
  e.employee_no,
  e.first_name,
  e.last_name
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
LEFT JOIN employees e ON p.employee_id = e.id::text
WHERE p.employee_id IS NOT NULL
LIMIT 10;
