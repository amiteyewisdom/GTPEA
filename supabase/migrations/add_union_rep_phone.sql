-- Reset guarantor_status for accounts that never actually applied (null application_date)
-- Board members and admins should not have pending guarantor status without applying
UPDATE employees 
SET guarantor_status = NULL, 
    guarantor_application_date = NULL, 
    guarantor_notes = NULL
WHERE guarantor_status = 'pending' 
  AND guarantor_application_date IS NULL;

-- Verify the reset
SELECT email, guarantor_status, guarantor_application_date 
FROM employees 
WHERE guarantor_status IS NOT NULL;
