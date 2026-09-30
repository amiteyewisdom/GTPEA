-- Fix the specific profile for user 72288981-1bfc-48a8-afe1-0320d76f7860
-- Link it to employee 1670c5d0-768a-4242-a1fd-c37cfc4b6fc2 (Wisdom Amiteye Yaw)
UPDATE profiles 
SET 
  employee_id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2',
  full_name = 'Wisdom Amiteye Yaw'
WHERE user_id = '72288981-1bfc-48a8-afe1-0320d76f7860';

-- Also update the employee record to have both phone fields populated
UPDATE employees 
SET 
  phone = '233548098753'
WHERE id = '1670c5d0-768a-4242-a1fd-c37cfc4b6fc2';
