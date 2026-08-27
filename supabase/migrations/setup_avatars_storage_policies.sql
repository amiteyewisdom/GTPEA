-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Avatars" ON storage.objects;

-- Allow public access to view avatars
CREATE POLICY "Public Access to Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated Users Can Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users Can Update Own Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users Can Delete Own Avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
