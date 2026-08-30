-- Add phone_number field to profiles table for non-employee OTP verification
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Add comment
COMMENT ON COLUMN profiles.phone_number IS 'Mobile phone number for OTP verification (for non-employee users)';
