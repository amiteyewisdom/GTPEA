-- Add guarantor_status field to employees table
ALTER TABLE employees 
ADD COLUMN guarantor_status TEXT DEFAULT 'pending' CHECK (guarantor_status IN ('pending', 'approved', 'suspended'));

-- Add guarantor_application_date to track when they applied
ALTER TABLE employees 
ADD COLUMN guarantor_application_date TIMESTAMP WITH TIME ZONE;

-- Add guarantor_approved_by to track who approved the guarantor status
ALTER TABLE employees 
ADD COLUMN guarantor_approved_by UUID REFERENCES employees(id);

-- Add guarantor_approved_at to track when the guarantor status was approved
ALTER TABLE employees 
ADD COLUMN guarantor_approved_at TIMESTAMP WITH TIME ZONE;

-- Add guarantor_notes for rejection/approval reasons
ALTER TABLE employees 
ADD COLUMN guarantor_notes TEXT;

-- Create index for faster queries on guarantor_status
CREATE INDEX idx_employees_guarantor_status ON employees(guarantor_status);
