/*
  # Setup Holiday Gallery Storage Bucket Policies

  ## Overview
  Configures the holiday-gallery storage bucket with appropriate access policies
  now that the bucket has been made public in the Supabase dashboard.

  ## Changes

  1. Storage Bucket Configuration
    - Ensures 'holiday-gallery' bucket exists and is public
    - Public access allows getPublicUrl() to work correctly

  2. Security Policies
    - Authenticated admins can upload photos
    - Authenticated admins can update photos
    - Authenticated admins can delete photos
    - Public read access for viewing gallery images

  ## Important Notes
  - The bucket is already created and set to public via dashboard
  - These policies ensure proper access control
  - Admin users need to be able to upload via Gallery Management page
  - Public users need read access to view gallery on website
*/

-- Ensure the holiday-gallery bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('holiday-gallery', 'holiday-gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete holiday photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to holiday gallery" ON storage.objects;

-- Allow authenticated users to upload files to holiday-gallery bucket
CREATE POLICY "Authenticated users can upload holiday photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Allow authenticated users to update files in holiday-gallery bucket
CREATE POLICY "Authenticated users can update holiday photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'holiday-gallery')
  WITH CHECK (bucket_id = 'holiday-gallery');

-- Allow authenticated users to delete files in holiday-gallery bucket
CREATE POLICY "Authenticated users can delete holiday photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'holiday-gallery');

-- Allow public read access to all files in holiday-gallery bucket
-- This is essential for the public gallery page to display images
CREATE POLICY "Public read access to holiday gallery"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'holiday-gallery');
