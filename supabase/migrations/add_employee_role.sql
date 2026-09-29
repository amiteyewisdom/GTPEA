-- Add role column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee';

-- Add index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- Add check constraint for valid roles
ALTER TABLE employees ADD CONSTRAINT employees_role_check 
  CHECK (role IN ('employee', 'chairperson', 'administrator', 'fund_manager', 'union_rep'));
