-- Fix: employees.guarantor_status was created with DEFAULT 'pending', so every inserted employee
-- (imports, approved pending-employees, seeds) appeared as a pending guarantor application without
-- ever applying. A real application always sets guarantor_application_date.
ALTER TABLE employees ALTER COLUMN guarantor_status DROP DEFAULT;

-- Clear phantom applications: pending with no application date means nobody applied.
UPDATE employees
SET guarantor_status = NULL,
    guarantor_notes = NULL
WHERE guarantor_status = 'pending'
  AND guarantor_application_date IS NULL;
