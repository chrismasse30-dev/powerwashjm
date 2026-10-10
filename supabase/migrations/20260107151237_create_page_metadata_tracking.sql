/*
  # Page Metadata Tracking System

  1. New Tables
    - `page_metadata`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - The URL path (e.g., "/house-washing", "/towns/warwick-ri")
      - `last_modified` (timestamptz) - When the page content was last updated
      - `change_frequency` (text) - How often the page changes (daily, weekly, monthly, yearly)
      - `priority` (decimal) - SEO priority (0.0 to 1.0)
      - `page_type` (text) - Category of page (service, town, info, blog)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `page_metadata` table
    - Add policies for public read access
    - Add policies for authenticated admin write access

  3. Notes
    - This table tracks metadata for all static pages to generate accurate sitemaps
    - Blog posts continue to use their own table
    - Admins can update last_modified dates when they make content changes
*/

-- Create the page_metadata table
CREATE TABLE IF NOT EXISTS page_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  last_modified timestamptz NOT NULL DEFAULT now(),
  change_frequency text NOT NULL DEFAULT 'monthly',
  priority decimal(2,1) NOT NULL DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
  page_type text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for sitemap generation)
CREATE POLICY "Allow public read access to page metadata"
  ON page_metadata
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage page metadata"
  ON page_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_metadata_slug ON page_metadata(slug);
CREATE INDEX IF NOT EXISTS idx_page_metadata_page_type ON page_metadata(page_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_page_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_page_metadata_timestamp
  BEFORE UPDATE ON page_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_page_metadata_updated_at();