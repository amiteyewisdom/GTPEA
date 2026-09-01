-- Check employee1's guarantor status
SELECT email, guarantor_status, guarantor_application_date, guarantor_notes 
FROM employees 
WHERE email = 'employee1@gtpea.com';

-- Check all pending guarantor applications
SELECT email, guarantor_status, guarantor_application_date 
FROM employees 
WHERE guarantor_status = 'pending';
