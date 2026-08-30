-- Add suspension fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Create index for suspended users
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);

-- Add comment
COMMENT ON COLUMN profiles.is_suspended IS 'Flag to indicate if user account is suspended';
COMMENT ON COLUMN profiles.suspended_at IS 'Timestamp when user was suspended';
