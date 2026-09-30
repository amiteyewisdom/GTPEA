-- Check what phone number is stored for employee 3165
SELECT 
  id,
  employee_no,
  first_name,
  last_name,
  email,
  phone
FROM employees
WHERE employee_no = '3165';

-- Also check the profile phone
SELECT 
  id,
  user_id,
  full_name,
  employee_id,
  phone
FROM profiles
WHERE phone = '233548098753';
