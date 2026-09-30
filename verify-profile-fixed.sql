-- Verify the profile is correctly set
SELECT
  p.id,
  p.user_id,
  u.email,
  p.full_name,
  p.employee_id,
  p.phone,
  e.first_name,
  e.last_name,
  e.employee_no
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
LEFT JOIN employees e ON p.employee_id = e.id::text
WHERE u.email = '3165@staff.gtpea.local';
