-- Add blacklist functionality to guarantor system
ALTER TABLE employees 
ADD COLUMN is_blacklisted BOOLEAN DEFAULT false;

ALTER TABLE employees 
ADD COLUMN blacklisted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE employees 
ADD COLUMN blacklisted_by UUID REFERENCES employees(id);

ALTER TABLE employees 
ADD COLUMN blacklist_reason TEXT;

-- Create index for faster queries on blacklisted status
CREATE INDEX idx_employees_blacklisted ON employees(is_blacklisted);

-- Update guarantor status check constraint to include blacklisted
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_guarantor_status_check;

ALTER TABLE employees 
ADD CONSTRAINT employees_guarantor_status_check 
CHECK (guarantor_status IN ('pending', 'approved', 'suspended', 'blacklisted'));
