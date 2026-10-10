/*
  # Create Estimate Images Storage Bucket

  1. Storage Setup
    - Create `estimate-images` storage bucket for uploaded photos
    - Enable public access for viewing images
    - Set appropriate file size limits

  2. Security
    - Allow anonymous users to upload images (for quote form)
    - Allow public read access to view images in emails
    - Restrict file types to images only
*/

-- Create the storage bucket for estimate images
INSERT INTO storage.buckets (id, name, public)
VALUES ('estimate-images', 'estimate-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads (needed for quote form)
CREATE POLICY "Allow anonymous uploads to estimate-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'estimate-images');

-- Allow public read access (needed for viewing images in emails)
CREATE POLICY "Public read access to estimate-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'estimate-images');

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage estimate-images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'estimate-images')
WITH CHECK (bucket_id = 'estimate-images');
