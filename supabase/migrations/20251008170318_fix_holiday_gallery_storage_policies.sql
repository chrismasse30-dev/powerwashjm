/*
  # Fix Holiday Gallery Storage Policies
  
  1. Changes
    - Drop existing storage policies for holiday-gallery bucket
    - Create new comprehensive policies that allow:
      - Public read access (SELECT)
      - Authenticated user uploads (INSERT)
      - Authenticated user updates (UPDATE)
      - Authenticated user deletes (DELETE)
  
  2. Security
    - Public can view all images in the bucket
    - Only authenticated users can upload, update, or delete files
    - No restrictions on authenticated user actions within this bucket
*/

-- Drop existing policies
DROP POLICY IF EXISTS "holiday_gallery_public_read" ON storage.objects;
DROP POLICY IF EXISTS "holiday_gallery_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "holiday_gallery_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "holiday_gallery_authenticated_delete" ON storage.objects;

-- Public read access for all files in holiday-gallery bucket
CREATE POLICY "holiday_gallery_public_select"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'holiday-gallery');

-- Authenticated users can insert files
CREATE POLICY "holiday_gallery_auth_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Authenticated users can update files
CREATE POLICY "holiday_gallery_auth_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'holiday-gallery')
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Authenticated users can delete files
CREATE POLICY "holiday_gallery_auth_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'holiday-gallery');
