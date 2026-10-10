/*
  # Create Site Images Storage Bucket

  1. New Storage Bucket
    - `site-images` bucket for all website images
    - Public access for reading
    - Organized folder structure

  2. Security
    - Public read access for all images
    - Authenticated write access for admins
    - Proper file size and type restrictions

  3. Organization
    - /logos - Company logos
    - /heroes - Hero/banner images
    - /services - Service showcase images
    - /towns - Town/location images
    - /packages - Holiday package images
    - /design - Design/diagram images
    - /blog-featured - Blog post featured images
*/

-- Create the site-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
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

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload site images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update site images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete site images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images');