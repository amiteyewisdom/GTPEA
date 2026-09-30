-- Revert test value if it was set
UPDATE profiles
SET employee_id = NULL
WHERE id = '9bbcd66e-94f8-4d39-aa58-1b4360a6b189' AND employee_id = 'TEST123';
