-- =============================================================================
-- GTPEA Finance Platform — Seed Data
-- All dummy/test data has been removed.
-- Employees, savings, loans, and transactions are created through the live UI.
-- Only the correct GTPEA loan products are seeded below.
-- =============================================================================

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
