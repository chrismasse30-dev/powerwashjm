/*
# Create missing storage buckets and policies

1. New Buckets
  - `fleet-photos` (public) - Fleet vehicle photos for the fleet washing page
  - Ensures `estimate-images` and `site-images` have proper INSERT policies

2. Storage Policies
  - fleet-photos: authenticated admin/employee upload, public read via bucket setting
  - estimate-images: add missing INSERT policy for authenticated users
  - site-images: add missing INSERT policy for authenticated admin/employee users

3. Important Notes
  - All three buckets were previously created manually without migrations
  - This migration ensures they are properly defined with correct policies
  - Uses IF NOT EXISTS for idempotency
*/

-- Create fleet-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('fleet-photos', 'fleet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Fleet photos: authenticated admin/employee can upload
DROP POLICY IF EXISTS "Admin can upload fleet photos" ON storage.objects;
CREATE POLICY "Admin can upload fleet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fleet-photos'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'employee')
    AND u.is_active = true
  )
);

DROP POLICY IF EXISTS "Admin can select fleet photos" ON storage.objects;
CREATE POLICY "Admin can select fleet photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fleet-photos'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'employee')
    AND u.is_active = true
  )
);

DROP POLICY IF EXISTS "Admin can update fleet photos" ON storage.objects;
CREATE POLICY "Admin can update fleet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fleet-photos'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'employee')
    AND u.is_active = true
  )
);

DROP POLICY IF EXISTS "Admin can delete fleet photos" ON storage.objects;
CREATE POLICY "Admin can delete fleet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fleet-photos'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'employee')
    AND u.is_active = true
  )
);

-- Estimate images: add INSERT policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can upload estimate images" ON storage.objects;
CREATE POLICY "Authenticated users can upload estimate images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'estimate-images');

-- Site images: add INSERT policy for admin/employee users
DROP POLICY IF EXISTS "Admin can upload site images" ON storage.objects;
CREATE POLICY "Admin can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'employee')
    AND u.is_active = true
  )
);
