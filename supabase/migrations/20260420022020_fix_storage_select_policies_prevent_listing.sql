/*
  # Fix public storage bucket SELECT policies to prevent directory listing

  ## Problem
  Each of the 4 public buckets (estimate-images, holiday-gallery, measurement-designs, site-images)
  had 2 duplicate broad SELECT policies on storage.objects that matched the entire bucket.
  This allows unauthenticated clients to LIST all files in the bucket, which exposes more data
  than intended. Direct URL access to individual objects does not require any RLS policy on
  public buckets, so the SELECT policies are only needed if you want to serve object metadata.

  ## Changes
  - Drop all 8 duplicate/broad SELECT policies across the 4 buckets
  - Add 1 replacement SELECT policy per bucket that restricts reads to authenticated users only,
    preventing anonymous listing while preserving direct public URL access (which bypasses RLS)

  ## Security notes
  - Public bucket object URLs continue to work for anyone with the direct URL
  - Anonymous clients can no longer enumerate/list bucket contents via the API
  - Authenticated admin users retain full read access for the management dashboards
*/

-- Drop all duplicate broad SELECT policies for estimate-images
DROP POLICY IF EXISTS "Public read access for estimate images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to estimate images" ON storage.objects;

-- Drop all duplicate broad SELECT policies for holiday-gallery
DROP POLICY IF EXISTS "Public read access for holiday gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to holiday gallery images" ON storage.objects;

-- Drop all duplicate broad SELECT policies for measurement-designs
DROP POLICY IF EXISTS "Public read access for measurement designs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to measurement designs" ON storage.objects;

-- Drop all duplicate broad SELECT policies for site-images
DROP POLICY IF EXISTS "Public read access for site images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to site images" ON storage.objects;

-- Replace with single authenticated-only SELECT policy per bucket
-- This prevents anonymous listing while direct public URLs still work (bypasses RLS)

CREATE POLICY "Authenticated users can read estimate images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'estimate-images');

CREATE POLICY "Authenticated users can read holiday gallery"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'holiday-gallery');

CREATE POLICY "Authenticated users can read measurement designs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'measurement-designs');

CREATE POLICY "Authenticated users can read site images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-images');
