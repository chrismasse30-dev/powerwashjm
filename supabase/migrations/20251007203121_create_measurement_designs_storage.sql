/*
  # Create Storage Bucket for Measurement Designs

  1. New Storage Bucket
    - `measurement-designs` bucket for storing QuickMeasure design images

  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload images
    - Set up appropriate RLS policies for the bucket
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('measurement-designs', 'measurement-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload measurement designs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'measurement-designs');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update measurement designs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'measurement-designs');

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access to measurement designs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'measurement-designs');
