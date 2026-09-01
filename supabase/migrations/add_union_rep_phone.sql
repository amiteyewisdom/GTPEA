-- Add phone number to union rep account
-- Email: unionrep@gtpaa.com
-- Phone: 0548098753

-- Update employees table
UPDATE employees 
SET phone_number = '0548098753'
WHERE email = 'unionrep@gtpaa.com';

-- Update profiles table
UPDATE profiles p
SET phone = '0548098753'
FROM employees e
WHERE e.email = 'unionrep@gtpaa.com'
  AND p.employee_id = e.id::text;
