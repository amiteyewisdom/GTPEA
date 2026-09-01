-- Add unique constraints to phone numbers to prevent duplicates across accounts

-- Remove existing indexes if they exist
DROP INDEX IF EXISTS idx_employees_phone_number;
DROP INDEX IF EXISTS idx_profiles_phone_number;

-- Add unique constraint to employees.phone_number
-- First, handle any existing duplicates by setting them to null
-- Using a different approach for UUID columns
WITH duplicates AS (
  SELECT phone_number
  FROM employees
  WHERE phone_number IS NOT NULL
  GROUP BY phone_number
  HAVING COUNT(*) > 1
)
UPDATE employees e
SET phone_number = NULL
WHERE phone_number IN (SELECT phone_number FROM duplicates)
AND id NOT IN (
  SELECT e2.id
  FROM employees e2
  WHERE e2.phone_number = e.phone_number
  ORDER BY e2.created_at
  LIMIT 1
);

-- Add unique constraint
ALTER TABLE employees 
ADD CONSTRAINT employees_phone_number_key UNIQUE (phone_number);

-- Add unique constraint to profiles.phone
-- First, handle any existing duplicates by setting them to null
WITH duplicates AS (
  SELECT phone
  FROM profiles
  WHERE phone IS NOT NULL
  GROUP BY phone
  HAVING COUNT(*) > 1
)
UPDATE profiles p
SET phone = NULL
WHERE phone IN (SELECT phone FROM duplicates)
AND user_id NOT IN (
  SELECT p2.user_id
  FROM profiles p2
  WHERE p2.phone = p.phone
  ORDER BY p2.created_at
  LIMIT 1
);

-- Add unique constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

-- Recreate indexes for lookups
CREATE INDEX IF NOT EXISTS idx_employees_phone_number ON employees(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add comments
COMMENT ON CONSTRAINT employees_phone_number_key ON employees IS 'Ensures phone numbers are unique across all employee accounts';
COMMENT ON CONSTRAINT profiles_phone_key ON profiles IS 'Ensures phone numbers are unique across all user profiles';
