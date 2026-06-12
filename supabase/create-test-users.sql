-- =============================================================================
-- GTPEA — Create System Users & Test Employees
-- Run in Supabase SQL Editor AFTER running reset-to-fresh.sql
-- =============================================================================
-- Passwords are all: Gtpea@2025
-- Change them after first login!
-- =============================================================================

-- ── Step 1: Create auth users ─────────────────────────────────────────────────
-- The trigger will auto-create a profiles row for each one.

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
VALUES
  -- Super Admin
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'superadmin@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Super Admin"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Administrator
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'admin@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Administrator"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Chairperson
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'chairperson@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Chairperson"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Fund Manager
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'fundmanager@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Fund Manager"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Union Rep
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'unionrep@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Union Rep"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Employee 1
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'employee1@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Test Employee One"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  -- Employee 2
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'employee2@gtpea.com',
   crypt('Gtpea@2025', gen_salt('bf')),
   now(), '{"full_name":"Test Employee Two"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '', '', '', '');

-- ── Step 2: Seed GTPEA loan products (safe - deletes old then inserts) ────────
DELETE FROM loan_products WHERE name IN (
  'Normal Loan','Hire Purchase','Quick Cash','Land Loan','School Fees','Car Loan',
  'Personal Loan','Emergency Loan','Business Loan','Education Loan','Vehicle Loan','Housing Loan','Regular Loan'
);

INSERT INTO loan_products (name, description, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, processing_fee_percent, requires_guarantor, max_loan_to_salary_ratio, is_active)
VALUES
  ('Normal Loan',   'Standard reducing balance loan.',                              0.02,  'reducing_balance', 500,   100000, 1,  48, 0.00, FALSE, 3, TRUE),
  ('Hire Purchase', 'Fixed asset financing. Flat rate interest on full principal.', 0.025, 'flat_rate',        200,   50000,  1,  12, 0.00, FALSE, 2, TRUE),
  ('Quick Cash',    'Short-term emergency cash loan.',                              0.05,  'reducing_balance', 100,   5000,   1,  6,  0.00, FALSE, 1, TRUE),
  ('Land Loan',     'Land acquisition. Amortized over up to 4 years.',             0.02,  'reducing_balance', 1000,  200000, 1,  48, 0.00, FALSE, 3, TRUE),
  ('School Fees',   'Academic calendar aligned school fees loan.',                 0.025, 'flat_rate',        200,   20000,  1,  12, 0.00, FALSE, 2, TRUE),
  ('Car Loan',      'Vehicle purchase loan.',                                       0.02,  'reducing_balance', 5000,  150000, 12, 60, 0.00, TRUE,  4, TRUE);

-- ── Step 3: Extend role enum with new values (safe - skips if already exists) ─
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'administrator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chairperson';

-- ── Step 4: Assign correct roles to profiles ──────────────────────────────────
UPDATE profiles SET role = 'super_admin'   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@gtpea.com');
UPDATE profiles SET role = 'administrator' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@gtpea.com');
UPDATE profiles SET role = 'chairperson'   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'chairperson@gtpea.com');
UPDATE profiles SET role = 'fund_manager'  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fundmanager@gtpea.com');
UPDATE profiles SET role = 'union_rep'     WHERE user_id = (SELECT id FROM auth.users WHERE email = 'unionrep@gtpea.com');
UPDATE profiles SET role = 'employee'      WHERE user_id = (SELECT id FROM auth.users WHERE email = 'employee1@gtpea.com');
UPDATE profiles SET role = 'employee'      WHERE user_id = (SELECT id FROM auth.users WHERE email = 'employee2@gtpea.com');

-- ── Step 4: Create employee records ───────────────────────────────────────────
INSERT INTO employees (employee_no, first_name, last_name, email, department, position, status, date_joined, salary, gender)
VALUES
  ('SA001',  'Super',  'Admin',       'superadmin@gtpea.com',  'management', 'Super Administrator', 'active', now(), 0.00,    'male'),
  ('ADM001', 'System', 'Admin',       'admin@gtpea.com',       'management', 'Administrator',       'active', now(), 0.00,    'male'),
  ('CH001',  'GTP',    'Chairperson', 'chairperson@gtpea.com', 'management', 'Chairperson',         'active', now(), 0.00,    'male'),
  ('FM001',  'GTP',    'FundManager', 'fundmanager@gtpea.com', 'finance',    'Fund Manager',        'active', now(), 0.00,    'male'),
  ('UR001',  'GTP',    'UnionRep',    'unionrep@gtpea.com',    'hr',         'Union Representative','active', now(), 0.00,    'male'),
  ('EMP001', 'Test',   'EmployeeOne', 'employee1@gtpea.com',   'operations', 'Staff',               'active', now(), 5000.00, 'male'),
  ('EMP002', 'Test',   'EmployeeTwo', 'employee2@gtpea.com',   'operations', 'Staff',               'active', now(), 4500.00, 'female');

-- ── Step 4: Link profiles to employee records ─────────────────────────────────
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'SA001')  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'ADM001') WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'CH001')  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'chairperson@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'FM001')  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fundmanager@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'UR001')  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'unionrep@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'EMP001') WHERE user_id = (SELECT id FROM auth.users WHERE email = 'employee1@gtpea.com');
UPDATE profiles SET employee_id = (SELECT id FROM employees WHERE employee_no = 'EMP002') WHERE user_id = (SELECT id FROM auth.users WHERE email = 'employee2@gtpea.com');

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT u.email, p.full_name, p.role, e.employee_no
FROM auth.users u
JOIN profiles p ON p.user_id = u.id
LEFT JOIN employees e ON e.id = p.employee_id::uuid
ORDER BY p.role;
