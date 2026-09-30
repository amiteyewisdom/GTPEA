-- Fix all profiles by linking them to their corresponding employee records
-- This matches profiles to employees based on email (staffID@staff.gtpea.local format)

UPDATE profiles p
SET 
  employee_id = e.id,
  full_name = CONCAT(e.first_name, ' ', e.last_name)
FROM employees e
WHERE p.user_id IN (
  SELECT id FROM auth.users 
  WHERE email = CONCAT(e.employee_no, '@staff.gtpea.local')
)
AND p.employee_id IS NULL;

-- Update all employee records to have consistent phone numbers
-- Copy phone_number to phone field if phone is null
UPDATE employees 
SET phone = phone_number
WHERE phone IS NULL AND phone_number IS NOT NULL;
