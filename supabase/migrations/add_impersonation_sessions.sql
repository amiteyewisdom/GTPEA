-- Create impersonation_sessions table for temporary impersonation tokens
CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    target_employee_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_token ON impersonation_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_expires ON impersonation_sessions(expires_at);

-- Add RLS
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view impersonation sessions"
  ON impersonation_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
