/*
  # Create Fleet Photos Table

  ## Description
  This migration creates a table to store fleet vehicle photos for display on the About Us page.

  ## New Tables
    - `fleet_photos`
      - `id` (uuid, primary key): Unique identifier for each fleet photo
      - `image_url` (text, required): URL or path to the fleet image
      - `title` (text): Title/caption for the fleet photo
      - `description` (text): Description of the vehicle/fleet
      - `display_order` (integer): Order for displaying multiple fleet images
      - `is_active` (boolean): Whether the photo is currently active/visible
      - `uploaded_at` (timestamptz): Timestamp of when photo was uploaded
      - `created_at` (timestamptz): Timestamp of record creation

  ## Security
    - Enable RLS on `fleet_photos` table
    - Add policy for public read access (anyone can view fleet photos)
    - Add policy for authenticated admin users to manage fleet photos

  ## Important Notes
    - Fleet photos are public-facing marketing content
    - Only admins can add/edit/delete fleet photos
    - Display order allows for flexible arrangement of photos
*/

-- Create fleet_photos table
CREATE TABLE IF NOT EXISTS fleet_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE fleet_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active fleet photos (public access)
CREATE POLICY "Public can view active fleet photos"
  ON fleet_photos
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Authenticated users can view all fleet photos
CREATE POLICY "Authenticated users can view all fleet photos"
  ON fleet_photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert fleet photos
CREATE POLICY "Authenticated users can insert fleet photos"
  ON fleet_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update fleet photos
CREATE POLICY "Authenticated users can update fleet photos"
  ON fleet_photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete fleet photos
CREATE POLICY "Authenticated users can delete fleet photos"
  ON fleet_photos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on display_order for efficient sorting
CREATE INDEX IF NOT EXISTS idx_fleet_photos_display_order ON fleet_photos(display_order);

-- Create index on is_active for filtering active photos
CREATE INDEX IF NOT EXISTS idx_fleet_photos_is_active ON fleet_photos(is_active);