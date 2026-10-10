/*
  # Cleanup Duplicate Holiday Gallery Storage Policies

  ## Overview
  Removes duplicate storage policies for the holiday-gallery bucket that were
  created across multiple migrations, keeping only one clean set.

  ## Changes
  - Drops all existing holiday-gallery policies
  - Creates a single clean set of policies with clear naming

  ## Security
  - Maintains proper access control
  - Authenticated users (admin) can upload, update, delete
  - Public users can read (view gallery images)
*/

-- Drop ALL existing holiday-gallery policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can delete from holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete holiday gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update holiday gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload holiday gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public users can view holiday gallery files" ON storage.objects;

-- Create clean, single set of policies

-- Policy 1: Upload (INSERT)
CREATE POLICY "holiday_gallery_authenticated_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Policy 2: Update
CREATE POLICY "holiday_gallery_authenticated_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'holiday-gallery')
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Policy 3: Delete
CREATE POLICY "holiday_gallery_authenticated_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'holiday-gallery');

-- Policy 4: Public Read (SELECT)
CREATE POLICY "holiday_gallery_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'holiday-gallery');
