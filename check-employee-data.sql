-- Check employee record and their savings/loans
-- Replace 'Wisdom Amiteye Yaw' or phone number as needed

-- 1. Find the employee by name or phone
SELECT 
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
WHERE 
  CONCAT(first_name, ' ', last_name) ILIKE '%Wisdom%'
  OR first_name ILIKE '%Wisdom%'
  OR last_name ILIKE '%Wisdom%'
  OR phone = '233548098753';

-- 2. Check savings accounts for this employee
SELECT 
  s.id,
  s.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  s.account_number,
  s.balance,
  s.status,
  s.created_at,
  s.updated_at
FROM savings s
JOIN employees e ON s.employee_id = e.id
WHERE 
  CONCAT(e.first_name, ' ', e.last_name) ILIKE '%Wisdom%'
  OR e.first_name ILIKE '%Wisdom%'
  OR e.last_name ILIKE '%Wisdom%'
  OR e.phone = '233548098753'
ORDER BY s.created_at DESC;

-- 3. Check loans for this employee
SELECT
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
  l.created_at,
  l.disbursement_date
FROM loans l
JOIN employees e ON l.employee_id = e.id
LEFT JOIN loan_products lp ON l.loan_product_id = lp.id
WHERE
  CONCAT(e.first_name, ' ', e.last_name) ILIKE '%Wisdom%'
  OR e.first_name ILIKE '%Wisdom%'
  OR e.last_name ILIKE '%Wisdom%'
  OR e.phone = '233548098753'
ORDER BY l.created_at DESC;

-- 4. Check profile data for this user
SELECT 
  p.id,
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.employee_id,
  p.phone,
  p.is_active
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE 
  p.full_name ILIKE '%Wisdom%'
  OR p.phone = '233548098753';

-- 5. Check if there are any savings/loans records at all (for debugging)
SELECT
  COUNT(*) as total_savings,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_savings,
  SUM(balance) as total_savings_balance
FROM savings;

SELECT
  COUNT(*) as total_loans,
  COUNT(CASE WHEN status IN ('approved', 'active', 'paid') THEN 1 END) as active_loans,
  SUM(outstanding_balance) as total_outstanding_balance
FROM loans;
