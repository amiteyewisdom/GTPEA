-- First, check what the actual email is in the database
SELECT email, phone_number FROM employees WHERE email LIKE '%unionrep%';

-- Add phone number to union rep account
-- Try both possible email variations
-- Phone: 0548098753

-- Update employees table (try both email variations)
UPDATE employees 
SET phone_number = '0548098753'
WHERE email = 'unionrep@gtpea.com';

UPDATE employees 
SET phone_number = '0548098753'
WHERE email = 'unionrep@gtpaa.com';

-- Update profiles table using the user_id from auth (try both email variations)
UPDATE profiles 
SET phone = '0548098753'
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'unionrep@gtpea.com'
);

UPDATE profiles 
SET phone = '0548098753'
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'unionrep@gtpaa.com'
);

-- Verify the update
SELECT e.email, e.phone_number, p.phone 
FROM employees e
LEFT JOIN profiles p ON p.user_id IN (SELECT id FROM auth.users WHERE email = e.email)
WHERE e.email LIKE '%unionrep%';
