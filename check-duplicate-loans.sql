-- Check for duplicate loans by employee
-- This will show loans that have the same employee_id, loan_product_id, and similar amounts

SELECT
  l.employee_id,
  e.employee_no,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  COUNT(*) as loan_count,
  STRING_AGG(l.id::text, ', ') as loan_ids,
  STRING_AGG(l.status::text, ', ') as statuses,
  STRING_AGG(l.loan_ref, ', ') as loan_refs,
  STRING_AGG(l.amount_requested::text, ', ') as amounts
FROM loans l
JOIN employees e ON l.employee_id = e.id
GROUP BY l.employee_id, e.employee_no, e.first_name, e.last_name
HAVING COUNT(*) > 1
ORDER BY e.employee_no;
