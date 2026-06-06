-- =============================================================================
-- GTPEA Finance Platform — Seed Data
-- Run this after schema.sql and after running seed-users.mjs
-- =============================================================================

-- Note: Auth users and profiles are created by seed-users.mjs
-- This script creates the employees table data and other test data

-- =============================================================================
-- 1. INSERT EMPLOYEES (matching users from seed-users.mjs)
-- =============================================================================

INSERT INTO employees (employee_no, first_name, last_name, email, phone, department, position, status, date_joined, date_of_birth, gender, salary, bank_name, bank_account_no) VALUES
-- Super Admin (superadmin@gtpea.com)
('SA001', 'Super', 'Admin', 'superadmin@gtpea.com', '+1234567890', 'management', 'Super Administrator', 'active', '2020-01-01', '1980-01-01', 'male', 150000.00, 'First Bank', '1234567890'),
-- Administrator (kay@gtpea.com)
('ADM001', 'Kay', 'Administrator', 'kay@gtpea.com', '+1234567891', 'management', 'System Administrator', 'active', '2020-02-01', '1982-03-15', 'female', 120000.00, 'First Bank', '1234567891'),
-- Chairperson (chair@gtpea.com)
('CH001', 'Chair', 'Person', 'chair@gtpea.com', '+1234567892', 'management', 'Chairperson', 'active', '2020-03-01', '1975-05-20', 'male', 180000.00, 'First Bank', '1234567892'),
-- Fund Manager (fund@gtpea.com)
('FM001', 'Fund', 'Manager', 'fund@gtpea.com', '+1234567893', 'finance', 'Fund Manager', 'active', '2020-04-01', '1985-08-10', 'female', 130000.00, 'First Bank', '1234567893'),
-- Union Rep (union@gtpea.com)
('UR001', 'Union', 'Representative', 'union@gtpea.com', '+1234567894', 'hr', 'Union Representative', 'active', '2020-05-01', '1988-11-25', 'male', 90000.00, 'First Bank', '1234567894'),
-- Employees (john@gtpea.com, jane@gtpea.com)
('EMP001', 'John', 'Doe', 'john@gtpea.com', '+1234567895', 'operations', 'Operations Manager', 'active', '2021-01-15', '1990-02-14', 'male', 85000.00, 'GT Bank', '9876543210'),
('EMP002', 'Jane', 'Smith', 'jane@gtpea.com', '+1234567896', 'sales', 'Sales Executive', 'active', '2021-02-20', '1992-06-30', 'female', 75000.00, 'GT Bank', '9876543211')
ON CONFLICT (employee_no) DO NOTHING;

-- =============================================================================
-- 2. UPDATE PROFILES WITH EMPLOYEE IDs
-- =============================================================================

UPDATE profiles SET employee_id = 'SA001' WHERE full_name = 'Super Admin';
UPDATE profiles SET employee_id = 'ADM001' WHERE full_name = 'Kay (Administrator)';
UPDATE profiles SET employee_id = 'CH001' WHERE full_name = 'Chairperson';
UPDATE profiles SET employee_id = 'FM001' WHERE full_name = 'Fund Manager';
UPDATE profiles SET employee_id = 'UR001' WHERE full_name = 'Union Representative';
UPDATE profiles SET employee_id = 'EMP001' WHERE full_name = 'John Doe';
UPDATE profiles SET employee_id = 'EMP002' WHERE full_name = 'Jane Smith';

-- =============================================================================
-- 3. INSERT LOAN PRODUCTS
-- =============================================================================

INSERT INTO loan_products (name, description, interest_rate, min_amount, max_amount, min_term_months, max_term_months, processing_fee_percent, interest_calc_method, requires_guarantor, max_loan_to_salary_ratio, is_active) VALUES
('Personal Loan', 'Personal expenses and emergencies', 0.15, 50000.00, 500000.00, 3, 24, 0.02, 'reducing_balance', TRUE, 3.0, TRUE),
('Emergency Loan', 'Urgent financial needs', 0.12, 20000.00, 200000.00, 1, 12, 0.01, 'reducing_balance', FALSE, 2.0, TRUE),
('Business Loan', 'Small business startup or expansion', 0.18, 100000.00, 2000000.00, 6, 36, 0.03, 'reducing_balance', TRUE, 4.0, TRUE),
('Education Loan', 'Educational expenses', 0.10, 50000.00, 1000000.00, 6, 48, 0.01, 'reducing_balance', FALSE, 3.5, TRUE),
('Vehicle Loan', 'Vehicle purchase', 0.16, 200000.00, 3000000.00, 12, 60, 0.025, 'reducing_balance', TRUE, 4.0, TRUE);

-- =============================================================================
-- 4. INSERT SAVINGS ACCOUNTS
-- =============================================================================

INSERT INTO savings (employee_id, type, status, balance, interest_rate, monthly_contribution, target_amount, maturity_date, account_number, notes) VALUES
-- John Doe
((SELECT id FROM employees WHERE employee_no = 'EMP001'), 'regular', 'active', 150000.00, 0.08, 10000.00, 500000.00, '2025-12-31', 'SAV-001-001', 'Regular savings account'),
((SELECT id FROM employees WHERE employee_no = 'EMP001'), 'special', 'active', 75000.00, 0.10, 5000.00, 200000.00, '2024-12-31', 'SAV-001-002', 'Special purpose savings'),
-- Jane Smith
((SELECT id FROM employees WHERE employee_no = 'EMP002'), 'regular', 'active', 85000.00, 0.08, 8000.00, 400000.00, '2025-06-30', 'SAV-002-001', 'Regular savings account')
ON CONFLICT (account_number) DO NOTHING;

-- =============================================================================
-- 5. INSERT SAMPLE LOANS
-- =============================================================================

INSERT INTO loans (loan_ref, employee_id, loan_product_id, amount_requested, amount_approved, amount_disbursed, outstanding_balance, interest_rate, processing_fee, term_months, monthly_repayment, status, purpose, disbursement_date, expected_completion_date) VALUES
-- John Doe - Active loan
('LN-2024-001', (SELECT id FROM employees WHERE employee_no = 'EMP001'), (SELECT id FROM loan_products WHERE name = 'Personal Loan'), 200000.00, 200000.00, 200000.00, 180000.00, 0.15, 4000.00, 12, 18333.33, 'repaying', 'Home renovation', '2024-01-15', '2025-01-15'),
-- Jane Smith - Completed loan
('LN-2023-001', (SELECT id FROM employees WHERE employee_no = 'EMP002'), (SELECT id FROM loan_products WHERE name = 'Emergency Loan'), 50000.00, 50000.00, 50000.00, 0.00, 0.12, 500.00, 6, 8583.33, 'completed', 'Medical emergency', '2023-06-01', '2023-12-01')
ON CONFLICT (loan_ref) DO NOTHING;

-- =============================================================================
-- 6. INSERT SAMPLE REPAYMENTS
-- =============================================================================

INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, paid_date, status) VALUES
-- John Doe's loan repayments
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 1, 18333.33, 18333.33, 15833.33, 2500.00, '2024-02-15', '2024-02-14', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 2, 18333.33, 18333.33, 16020.83, 2312.50, '2024-03-15', '2024-03-12', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 3, 18333.33, 18333.33, 16208.33, 2125.00, '2024-04-15', '2024-04-10', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 4, 18333.33, 18333.33, 16395.83, 1937.50, '2024-05-15', '2024-05-08', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 5, 18333.33, 18333.33, 16583.33, 1750.00, '2024-06-15', '2024-06-05', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 6, 18333.33, 18333.33, 16770.83, 1562.50, '2024-07-15', '2024-07-02', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 7, 18333.33, 18333.33, 16958.33, 1375.00, '2024-08-15', '2024-08-01', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 8, 18333.33, 18333.33, 17145.83, 1187.50, '2024-09-15', '2024-09-03', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 9, 18333.33, 18333.33, 17333.33, 1000.00, '2024-10-15', '2024-10-05', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 10, 18333.33, 18333.33, 17520.83, 812.50, '2024-11-15', '2024-11-02', 'paid'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 11, 18333.33, 0.00, 0.00, 0.00, '2024-12-15', NULL, 'pending'),
((SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), (SELECT id FROM employees WHERE employee_no = 'EMP001'), 12, 18333.33, 0.00, 0.00, 0.00, '2025-01-15', NULL, 'pending')
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- =============================================================================
-- 7. INSERT SAMPLE TRANSACTIONS
-- =============================================================================

INSERT INTO transactions (reference, employee_id, type, amount, balance_before, balance_after, description, related_id, related_type) VALUES
-- John Doe savings deposits
('TXN-2024-001', (SELECT id FROM employees WHERE employee_no = 'EMP001'), 'savings_deposit', 10000.00, 140000.00, 150000.00, 'Monthly savings contribution', (SELECT id FROM savings WHERE account_number = 'SAV-001-001'), 'savings'),
('TXN-2024-002', (SELECT id FROM employees WHERE employee_no = 'EMP001'), 'savings_deposit', 5000.00, 70000.00, 75000.00, 'Monthly special savings', (SELECT id FROM savings WHERE account_number = 'SAV-001-002'), 'savings'),
-- Loan disbursement
('TXN-2024-003', (SELECT id FROM employees WHERE employee_no = 'EMP001'), 'loan_disbursement', 200000.00, 0.00, 200000.00, 'Personal loan disbursement', (SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), 'loan'),
-- Loan repayments
('TXN-2024-004', (SELECT id FROM employees WHERE employee_no = 'EMP001'), 'loan_repayment', 18333.33, 200000.00, 181666.67, 'Loan repayment - installment 1', (SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), 'loan'),
('TXN-2024-005', (SELECT id FROM employees WHERE employee_no = 'EMP001'), 'loan_repayment', 18333.33, 181666.67, 163333.34, 'Loan repayment - installment 2', (SELECT id FROM loans WHERE loan_ref = 'LN-2024-001'), 'loan')
ON CONFLICT (reference) DO NOTHING;

-- =============================================================================
-- 8. INSERT SAMPLE WITHDRAWAL REQUESTS
-- =============================================================================

INSERT INTO withdrawal_requests (request_ref, employee_id, savings_id, amount, reason, status, requested_at) VALUES
('WDR-2024-001', (SELECT id FROM employees WHERE employee_no = 'EMP001'), (SELECT id FROM savings WHERE account_number = 'SAV-001-001'), 30000.00, 'Medical expenses', 'approved', '2024-05-01'),
('WDR-2024-002', (SELECT id FROM employees WHERE employee_no = 'EMP002'), (SELECT id FROM savings WHERE account_number = 'SAV-002-001'), 15000.00, 'School fees', 'pending', '2024-06-15')
ON CONFLICT (request_ref) DO NOTHING;

-- =============================================================================
-- 9. INSERT SAMPLE APPROVALS
-- =============================================================================

INSERT INTO approvals (entity_type, entity_id, status, current_stage, total_stages, submitted_by, submitted_at) VALUES
('withdrawal', (SELECT id FROM withdrawal_requests WHERE request_ref = 'WDR-2024-002'), 'pending', 1, 3, (SELECT id FROM profiles WHERE full_name = 'Jane Smith'), '2024-06-15')
ON CONFLICT DO NOTHING;
