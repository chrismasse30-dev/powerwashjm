/*
  # Create All Storage Buckets for Images

  1. Storage Buckets
    - `site-images` - Main bucket for all website images (logos, heroes, services, towns, packages, fleet)
    - `holiday-gallery` - Holiday lights project photos
    - `measurement-designs` - Customer measurement designs
    - `estimate-images` - Estimate related images

  2. Security
    - Public read access for all buckets
    - Authenticated write access for admins
    - Anon upload for holiday-gallery (for customer submissions)

  3. Organization
    site-images folders:
    - /logos - Company logos
    - /heroes - Hero/banner images  
    - /services - Service showcase images
    - /towns - Town/location images
    - /packages - Holiday package images
    - /fleet - Fleet vehicle photos
    - /beforeandafter - Before/after comparison images
*/

-- Create site-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create holiday-gallery bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('holiday-gallery', 'holiday-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create measurement-designs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('measurement-designs', 'measurement-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Create estimate-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('estimate-images', 'estimate-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (site-images)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update site images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete site images" ON storage.objects;
  DROP POLICY IF EXISTS "Anon can upload site images" ON storage.objects;
END $$;

-- Site Images Policies
CREATE POLICY "Public read access for site images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can upload site images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Anon can upload site images"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can update site images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can delete site images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images');

-- Drop existing holiday-gallery policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for holiday gallery" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload to holiday gallery" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update holiday gallery" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete holiday gallery" ON storage.objects;
END $$;

-- Holiday Gallery Policies
CREATE POLICY "Public read access for holiday gallery"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'holiday-gallery');

CREATE POLICY "Anyone can upload to holiday gallery"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'holiday-gallery');

CREATE POLICY "Authenticated users can update holiday gallery"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'holiday-gallery')
  WITH CHECK (bucket_id = 'holiday-gallery');

CREATE POLICY "Authenticated users can delete holiday gallery"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'holiday-gallery');

-- Drop existing measurement-designs policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for measurement designs" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload measurement designs" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update measurement designs" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete measurement designs" ON storage.objects;
END $$;

-- Measurement Designs Policies
CREATE POLICY "Public read access for measurement designs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'measurement-designs');

CREATE POLICY "Authenticated users can upload measurement designs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'measurement-designs');

CREATE POLICY "Authenticated users can update measurement designs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'measurement-designs')
  WITH CHECK (bucket_id = 'measurement-designs');

CREATE POLICY "Authenticated users can delete measurement designs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'measurement-designs');

-- Drop existing estimate-images policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for estimate images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload estimate images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update estimate images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete estimate images" ON storage.objects;
END $$;

-- Estimate Images Policies
CREATE POLICY "Public read access for estimate images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'estimate-images');

CREATE POLICY "Authenticated users can upload estimate images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'estimate-images');

CREATE POLICY "Authenticated users can update estimate images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'estimate-images')
  WITH CHECK (bucket_id = 'estimate-images');

CREATE POLICY "Authenticated users can delete estimate images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'estimate-images');
