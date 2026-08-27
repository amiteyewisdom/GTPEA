-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Update bucket to be public if it already exists
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
