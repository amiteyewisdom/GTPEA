-- Check for employee with staff ID 3165

-- 1. Find employee by employee_no = 3165
SELECT 
  'EMPLOYEE 3165' as query_type,
  id,
  first_name,
  last_name,
  CONCAT(first_name, ' ', last_name) as full_name,
  employee_no,
  phone,
  email,
  status,
  department
FROM employees
WHERE employee_no = '3165';

-- 2. Check savings for employee 3165
SELECT 
  'SAVINGS FOR 3165' as query_type,
  s.id,
  s.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  s.account_number,
  s.balance,
  s.status,
  s.created_at
FROM savings s
JOIN employees e ON s.employee_id = e.id
WHERE e.employee_no = '3165'
ORDER BY s.created_at DESC;

-- 3. Check loans for employee 3165
SELECT
  'LOANS FOR 3165' as query_type,
  l.id,
  l.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  l.loan_product_id,
  lp.name as product_name,
  l.amount_requested,
  l.amount_approved,
  l.amount_disbursed,
  l.outstanding_balance,
  l.status,
  l.created_at
FROM loans l
JOIN employees e ON l.employee_id = e.id
LEFT JOIN loan_products lp ON l.loan_product_id = lp.id
WHERE e.employee_no = '3165'
ORDER BY l.created_at DESC;
