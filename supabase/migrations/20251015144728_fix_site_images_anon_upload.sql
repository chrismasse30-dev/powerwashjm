/*
  # Fix Site Images Storage - Allow Anon Uploads

  1. Changes
    - Drop existing restrictive policies
    - Allow anon key uploads for site management
    - Maintain public read access

  2. Security
    - Public read access for all images
    - Anon/authenticated write access for site management
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete site images" ON storage.objects;
END $$;

-- Allow public read access to all images
CREATE POLICY "Public read access for site images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'site-images');

-- Allow anon and authenticated users to upload images
CREATE POLICY "Anyone can upload site images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'site-images');

-- Allow anon and authenticated users to update images
CREATE POLICY "Anyone can update site images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');

-- Allow anon and authenticated users to delete images
CREATE POLICY "Anyone can delete site images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'site-images');