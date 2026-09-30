-- Check the loan status for employee 3165
SELECT
  id,
  loan_ref,
  employee_id,
  amount_requested,
  amount_approved,
  amount_disbursed,
  outstanding_balance,
  status,
  created_at
FROM loans
WHERE employee_id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2';
