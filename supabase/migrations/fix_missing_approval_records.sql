-- Fix missing approval records for loans that have guarantor approval
-- This creates approval records for loans that were approved by guarantors but failed to create approval records due to profile lookup issues

-- First, let's check the current state and get the correct user_id
-- The loan applicant employee_id from the logs is: e0f46a7e-d53a-4ff8-a80d-0ece47980fb6

-- Check the loan applicant's user_id (employees table doesn't have user_id, need to go through profiles)
SELECT 
    e.id as employee_id,
    e.employee_no,
    e.first_name,
    e.last_name,
    p.id as profile_id,
    p.user_id as profile_user_id
FROM employees e
LEFT JOIN profiles p ON e.employee_no = p.employee_id
WHERE e.id = 'e0f46a7e-d53a-4ff8-a80d-0ece47980fb6';

-- Check which loans need approval records
SELECT 
    l.id,
    l.loan_ref,
    l.employee_id,
    l.status,
    lg.consent_status,
    a.id as approval_id
FROM loans l
LEFT JOIN loan_guarantors lg ON l.id = lg.loan_id
LEFT JOIN approvals a ON a.entity_type = 'loan' AND a.entity_id = l.id
WHERE l.id IN (
    '76a83a5e-01a7-4038-b9d7-73c81da7f0d2',
    '7a2d2902-9c00-4fe9-bfbe-c7986097414c',
    '35fc42b6-22f4-479a-af2c-81960c8aa651'
);

-- Create approval records for the 3 loans that have guarantor approval but no approval records
-- Loan 1: LOAN-MTU6DYL9-VBRD (76a83a5e-01a7-4038-b9d7-73c81da7f0d2)
-- Loan 2: LOAN-MTU7EKUG-7P0V (7a2d2902-9c00-4fe9-bfbe-c7986097414c)  
-- Loan 3: LOAN-MTUA8TGJ-6OFT (35fc42b6-22f4-479a-af2c-81960c8aa651)

-- Insert approval records using the loan applicant's user_id (through profiles)
INSERT INTO approvals (entity_type, entity_id, status, current_stage, total_stages, submitted_by, submitted_at)
SELECT 
    'loan' as entity_type,
    l.id as entity_id,
    'pending' as status,
    1 as current_stage,
    3 as total_stages,
    p.user_id as submitted_by,
    NOW() as submitted_at
FROM loans l
JOIN employees l_employee ON l.employee_id = l_employee.id
JOIN profiles p ON l_employee.employee_no = p.employee_id
WHERE l.id IN (
    '76a83a5e-01a7-4038-b9d7-73c81da7f0d2',
    '7a2d2902-9c00-4fe9-bfbe-c7986097414c',
    '35fc42b6-22f4-479a-af2c-81960c8aa651'
)
AND NOT EXISTS (
    SELECT 1 FROM approvals a 
    WHERE a.entity_type = 'loan' 
    AND a.entity_id = l.id
);

-- Update loan status to pending for these loans
UPDATE loans
SET status = 'pending'
WHERE id IN (
    '76a83a5e-01a7-4038-b9d7-73c81da7f0d2',
    '7a2d2902-9c00-4fe9-bfbe-c7986097414c',
    '35fc42b6-22f4-479a-af2c-81960c8aa651'
)
AND status != 'pending';

-- Verify the approval records were created
SELECT 
    a.id,
    a.entity_id,
    l.loan_ref,
    l.amount_requested,
    a.status,
    a.current_stage,
    a.total_stages,
    a.submitted_at,
    a.submitted_by
FROM approvals a
JOIN loans l ON a.entity_id = l.id
WHERE a.entity_id IN (
    '76a83a5e-01a7-4038-b9d7-73c81da7f0d2',
    '7a2d2902-9c00-4fe9-bfbe-c7986097414c',
    '35fc42b6-22f4-479a-af2c-81960c8aa651'
);
