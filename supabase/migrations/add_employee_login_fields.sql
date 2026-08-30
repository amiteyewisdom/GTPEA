-- Add phone number and first login fields to employees table for OTP authentication
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_employees_phone_number ON employees(phone_number);

-- Add comment
COMMENT ON COLUMN employees.phone_number IS 'Mobile phone number for OTP verification';
COMMENT ON COLUMN employees.is_first_login IS 'Flag to track if this is the employee first login (requires password change)';
COMMENT ON COLUMN employees.password_changed_at IS 'Timestamp when employee last changed their password';
