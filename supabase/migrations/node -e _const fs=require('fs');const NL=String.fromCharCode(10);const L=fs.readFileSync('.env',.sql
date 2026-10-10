/*
  # Create Holiday Gallery Photos Table

  1. New Tables
    - `holiday_gallery_photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `image_url` (text) - URL to the stored image in Supabase storage
      - `title` (text) - Optional title for the photo
      - `description` (text) - Optional description of the project
      - `uploaded_at` (timestamptz) - Timestamp when photo was uploaded
      - `display_order` (integer) - Order for displaying photos in gallery
      - `is_featured` (boolean) - Whether photo should be featured prominently

  2. Security
    - Enable RLS on `holiday_gallery_photos` table
    - Add policy for public users to view photos
    - Add policy for authenticated users to upload photos
    - Add policy for authenticated users to update and delete photos

  3. Storage
    - Photos will be stored in a Supabase storage bucket named 'holiday-gallery'
*/

CREATE TABLE IF NOT EXISTS holiday_gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false
);

ALTER TABLE holiday_gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view holiday gallery photos"
  ON holiday_gallery_photos
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert holiday gallery photos"
  ON holiday_gallery_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update holiday gallery photos"
  ON holiday_gallery_photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete holiday gallery photos"
  ON holiday_gallery_photos
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_holiday_gallery_display_order ON holiday_gallery_photos(display_order);
CREATE INDEX IF NOT EXISTS idx_holiday_gallery_featured ON holiday_gallery_photos(is_featured);
