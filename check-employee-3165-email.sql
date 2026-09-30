-- Check what email is stored for employee 3165
SELECT 
  id,
  employee_no,
  first_name,
  last_name,
  email,
  phone
FROM employees
WHERE employee_no = '3165';
