-- Create custom_sessions table for custom authentication
CREATE TABLE IF NOT EXISTS custom_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_custom_sessions_token ON custom_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_refresh ON custom_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_user_id ON custom_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_expires ON custom_sessions(expires_at);

-- Add RLS
ALTER TABLE custom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON custom_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all sessions"
  ON custom_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
