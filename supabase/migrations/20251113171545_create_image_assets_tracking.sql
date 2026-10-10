/*
  # Image Assets Tracking System
  
  1. New Tables
    - `image_assets`
      - `id` (uuid, primary key)
      - `file_path` (text, unique) - Relative path from public/ folder
      - `file_name` (text) - Just the filename
      - `category` (text) - Type of image (hero, service, logo, etc.)
      - `alt_text` (text) - SEO alt text for the image
      - `expected_min_size_kb` (integer) - Minimum expected file size to detect placeholders
      - `is_critical` (boolean) - Whether image is critical for homepage/key pages
      - `last_verified_at` (timestamptz) - Last time file was verified
      - `status` (text) - 'active', 'missing', 'placeholder', 'broken'
      - `usage_locations` (text[]) - Array of pages/components using this image
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `image_assets` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
  
  3. Purpose
    - Track all image assets in the project
    - Prevent placeholder images from being deployed
    - Monitor image health and usage
    - Provide image inventory for developers
*/

CREATE TABLE IF NOT EXISTS image_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text UNIQUE NOT NULL,
  file_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('hero', 'service', 'logo', 'town', 'package', 'fleet', 'beforeafter', 'section', 'design', 'other')),
  alt_text text,
  expected_min_size_kb integer DEFAULT 50,
  is_critical boolean DEFAULT false,
  last_verified_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'missing', 'placeholder', 'broken')),
  usage_locations text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image assets"
  ON image_assets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage image assets"
  ON image_assets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_image_assets_category ON image_assets(category);
CREATE INDEX idx_image_assets_status ON image_assets(status);
CREATE INDEX idx_image_assets_is_critical ON image_assets(is_critical);
CREATE INDEX idx_image_assets_file_path ON image_assets(file_path);

COMMENT ON TABLE image_assets IS 'Tracks all image assets to prevent broken/placeholder images from being deployed';
COMMENT ON COLUMN image_assets.expected_min_size_kb IS 'Minimum file size in KB - files smaller than this are likely placeholders';
COMMENT ON COLUMN image_assets.is_critical IS 'Critical images that must be checked before every deployment';
COMMENT ON COLUMN image_assets.usage_locations IS 'Array of page paths or component names where this image is used';