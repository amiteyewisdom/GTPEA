-- Direct fix for profile 9bbcd66e-94f8-4d39-aa58-1b4360a6b189
-- Update with employee ID for staff 3165 (Wisdom Amiteye Yaw)
UPDATE profiles
SET
  employee_id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2',
  full_name = 'Wisdom Amiteye Yaw'
WHERE id = '9bbcd66e-94f8-4d39-aa58-1b4360a6b189';

-- Verify the fix
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
