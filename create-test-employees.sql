-- Create 4 test employees for system testing
-- These will have different roles to test the system
-- All will skip password change and OTP verification

-- Test Employee 1: Union Rep (Stage 1 approver)
INSERT INTO employees (id, first_name, last_name, employee_no, department, position, email, phone, status, date_joined, guarantor_status, is_blacklisted)
VALUES (
  gen_random_uuid(),
  'Kwame',
  'Asante',
  'TEST001',
  'Finance',
  'Finance Officer',
  'kwame.asante@gtpea.test',
  '233500000001',
  'active',
  '2023-01-15',
  'approved',
  false
) ON CONFLICT (employee_no) DO NOTHING;

-- Test Employee 2: Fund Manager (Stage 2 approver)
INSERT INTO employees (id, first_name, last_name, employee_no, department, position, email, phone, status, date_joined, guarantor_status, is_blacklisted)
VALUES (
  gen_random_uuid(),
  'Ama',
  'Owusu',
  'TEST002',
  'Finance',
  'Fund Manager',
  'ama.owusu@gtpea.test',
  '233500000002',
  'active',
  '2022-06-10',
  'approved',
  false
) ON CONFLICT (employee_no) DO NOTHING;

-- Test Employee 3: Chairperson (Stage 3 approver)
INSERT INTO employees (id, first_name, last_name, employee_no, department, position, email, phone, status, date_joined, guarantor_status, is_blacklisted)
VALUES (
  gen_random_uuid(),
  'Kofi',
  'Mensa',
  'TEST003',
  'Management',
  'Chairperson',
  'kofi.mensa@gtpea.test',
  '233500000003',
  'active',
  '2021-03-20',
  'approved',
  false
) ON CONFLICT (employee_no) DO NOTHING;

-- Test Employee 4: Regular Employee (borrower)
INSERT INTO employees (id, first_name, last_name, employee_no, department, position, email, phone, status, date_joined, guarantor_status, is_blacklisted)
VALUES (
  gen_random_uuid(),
  'Efua',
  'Doe',
  'TEST004',
  'Finance',
  'Finance Staff',
  'efua.doe@gtpea.test',
  '233500000004',
  'active',
  '2024-01-05',
  'approved',
  false
) ON CONFLICT (employee_no) DO NOTHING;

-- Create savings accounts for test employees
INSERT INTO savings (id, employee_id, account_number, type, balance, status, created_at)
SELECT 
  gen_random_uuid(),
  e.id,
  'SAV' || e.employee_no,
  'regular',
  50000.00, -- Starting balance of GH₵50,000
  'active',
  NOW()
FROM employees e
WHERE e.employee_no IN ('TEST001', 'TEST002', 'TEST003', 'TEST004')
ON CONFLICT DO NOTHING;

-- Note: After running this SQL, you need to:
-- 1. Create auth users in Supabase Auth for each employee
-- 2. Create profile records (all with "employee" role initially)
-- 3. Set must_change_password = false for all profiles
-- 4. Use Super Admin dashboard to assign roles:
--    - TEST001 → union_rep
--    - TEST002 → fund_manager
--    - TEST003 → chairperson
--    - TEST004 → employee (no change)

-- You can create these using the Supabase dashboard or by running scripts/create-test-users.mjs
