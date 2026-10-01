-- Fix: guard_profiles_protected_columns silently reverted role/is_active/employee_id changes made
-- via the service role (auth.uid() is NULL there, so requester_role was NULL and the guard fired).
-- BYPASSRLS does not skip triggers. Allow service_role explicitly via the JWT role claim.
CREATE OR REPLACE FUNCTION guard_profiles_protected_columns()
RETURNS TRIGGER AS $$
DECLARE
  requester_role TEXT;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
  THEN
    IF COALESCE(auth.role(), '') = 'service_role' THEN
      RETURN NEW;
    END IF;

    SELECT role::text INTO requester_role FROM profiles WHERE user_id = auth.uid();

    IF requester_role IS DISTINCT FROM 'super_admin' AND requester_role IS DISTINCT FROM 'administrator' THEN
      NEW.role := OLD.role;
      NEW.is_active := OLD.is_active;
      NEW.employee_id := OLD.employee_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
