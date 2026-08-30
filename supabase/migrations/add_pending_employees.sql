-- Create pending_employees table for imported employee data awaiting approval
CREATE TABLE IF NOT EXISTS pending_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  imported_by UUID REFERENCES auth.users(id),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create indexes for lookups
CREATE INDEX IF NOT EXISTS idx_pending_employees_employee_no ON pending_employees(employee_no);
CREATE INDEX IF NOT EXISTS idx_pending_employees_email ON pending_employees(email);
CREATE INDEX IF NOT EXISTS idx_pending_employees_status ON pending_employees(status);

-- Enable RLS
ALTER TABLE pending_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can view all pending employees"
  ON pending_employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert pending employees"
  ON pending_employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update pending employees"
  ON pending_employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete pending employees"
  ON pending_employees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Add comments
COMMENT ON TABLE pending_employees IS 'Imported employee data awaiting approval for account creation';
COMMENT ON COLUMN pending_employees.status IS 'Status of the import: pending, approved, or rejected';
