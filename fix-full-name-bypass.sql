-- Temporarily disable the guard trigger
DROP TRIGGER IF EXISTS guard_profiles_protected_columns_trigger ON profiles;

-- Update both employee_id and full_name
UPDATE profiles
SET
  employee_id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2',
  full_name = 'Wisdom Amiteye Yaw'
WHERE id = '9bbcd66e-94f8-4d39-aa58-1b4360a6b189';

-- Re-create the trigger
CREATE TRIGGER guard_profiles_protected_columns_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION guard_profiles_protected_columns();

-- Verify
SELECT
  p.id,
  p.user_id,
  u.email,
  p.full_name,
  p.employee_id,
  p.phone,
  e.first_name,
  e.last_name,
  e.employee_no
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
LEFT JOIN employees e ON p.employee_id = e.id::text
WHERE u.email = '3165@staff.gtpea.local';
