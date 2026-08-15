-- Fix existing loans by setting disbursement dates and creating repayment schedules
-- Run this in Supabase SQL Editor

-- First, update loans to set disbursement_date and amount_approved where missing
UPDATE loans 
SET 
  disbursement_date = COALESCE(disbursement_date, created_at::date, CURRENT_DATE),
  amount_approved = COALESCE(amount_approved, amount_requested, monthly_repayment * term_months),
  status = 'disbursed'
WHERE status IN ('approved', 'disbursed', 'repaying') 
  AND disbursement_date IS NULL;

-- Now create repayment schedules for each loan
-- This is a simplified approach - for production you'd want to use the proper amortization calculation

-- For loan LN-003
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  '2eccd9d3-f6bb-496a-b883-dd3986c0efe1',
  employee_id,
  generate_series(1, 6) as installment_no,
  600.00 / 6 as amount_due,
  0 as amount_paid,
  (600.00 / 6) * 0.9 as principal_component,
  (600.00 / 6) * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 6) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = '2eccd9d3-f6bb-496a-b883-dd3986c0efe1'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LN-005
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  '62e51618-af8c-49b4-bea8-75fdfe81df67',
  employee_id,
  generate_series(1, 48) as installment_no,
  800.00 / 48 as amount_due,
  0 as amount_paid,
  (800.00 / 48) * 0.9 as principal_component,
  (800.00 / 48) * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 48) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = '62e51618-af8c-49b4-bea8-75fdfe81df67'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LN-004
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  '9b4a75e8-4f24-4a68-8280-860d690e99a5',
  employee_id,
  generate_series(1, 12) as installment_no,
  100.00 / 12 as amount_due,
  0 as amount_paid,
  (100.00 / 12) * 0.9 as principal_component,
  (100.00 / 12) * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 12) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = '9b4a75e8-4f24-4a68-8280-860d690e99a5'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LOAN-MQAPLBLQ-4DDM
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  '9bea3d5a-a5d1-49de-b16a-cca790cd08f4',
  employee_id,
  generate_series(1, 4) as installment_no,
  131.31 as amount_due,
  0 as amount_paid,
  131.31 * 0.9 as principal_component,
  131.31 * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 4) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = '9bea3d5a-a5d1-49de-b16a-cca790cd08f4'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LOAN-MQAZMMUV-747U
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  'e77f8f46-d921-4aa7-84b4-138ec9076d02',
  employee_id,
  generate_series(1, 6) as installment_no,
  3833.33 as amount_due,
  0 as amount_paid,
  3833.33 * 0.9 as principal_component,
  3833.33 * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 6) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = 'e77f8f46-d921-4aa7-84b4-138ec9076d02'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LOAN-MQAFU2QW-XM4D
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  'f7d04402-9988-4247-88ea-a6a8a3d8b693',
  employee_id,
  generate_series(1, 3) as installment_no,
  173.38 as amount_due,
  0 as amount_paid,
  173.38 * 0.9 as principal_component,
  173.38 * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 3) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = 'f7d04402-9988-4247-88ea-a6a8a3d8b693'
ON CONFLICT (loan_id, installment_no) DO NOTHING;

-- For loan LOAN-MQAUWV4D-APG4
INSERT INTO repayments (loan_id, employee_id, installment_no, amount_due, amount_paid, principal_component, interest_component, due_date, status)
SELECT 
  'ff1f698e-5819-48b7-a9b3-30dab64883b8',
  employee_id,
  generate_series(1, 12) as installment_no,
  1083.33 as amount_due,
  0 as amount_paid,
  1083.33 * 0.9 as principal_component,
  1083.33 * 0.1 as interest_component,
  (disbursement_date + (generate_series(1, 12) - 1) * INTERVAL '1 month')::date as due_date,
  'pending' as status
FROM loans 
WHERE id = 'ff1f698e-5819-48b7-a9b3-30dab64883b8'
ON CONFLICT (loan_id, installment_no) DO NOTHING;
