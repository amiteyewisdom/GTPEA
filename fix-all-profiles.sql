-- Fix all profiles by linking them to their corresponding employee records
-- This matches profiles to employees based on email (staffID@staff.gtpea.local format)

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

-- Update all employee records to have consistent phone numbers
-- This is a placeholder - phone_number column doesn't exist in employees table
-- If you need to sync phone from another source, add that logic here
