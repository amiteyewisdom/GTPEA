-- Fix: RLS policies compare employees.employee_no = current_employee_id(), but profiles.employee_id
-- holds the employees.id UUID for most accounts, so employees could not read their own rows
-- (employees, savings, loans, ...). Resolve a UUID to its employee_no; pass through otherwise.
CREATE OR REPLACE FUNCTION current_employee_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT e.employee_no FROM employees e WHERE e.id::text = p.employee_id),
    p.employee_id
  )
  FROM profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
