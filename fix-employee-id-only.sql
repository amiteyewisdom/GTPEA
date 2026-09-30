-- Fix only the employee_id for this profile
UPDATE profiles
SET employee_id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2'
WHERE id = '9bbcd66e-94f8-4d39-aa58-1b4360a6b189';

-- Verify the fix
SELECT
  id,
  user_id,
  full_name,
  employee_id,
  phone
FROM profiles
WHERE id = '9bbcd66e-94f8-4d39-aa58-1b4360a6b189';
