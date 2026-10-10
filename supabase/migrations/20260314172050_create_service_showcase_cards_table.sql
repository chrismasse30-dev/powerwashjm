/*
  # Create Service Showcase Cards Table

  1. New Tables
    - `service_showcase_cards`
      - `id` (uuid, primary key)
      - `service_name` (text) - Display name (e.g., "House Washing")
      - `service_slug` (text) - URL slug for linking to service page
      - `image_url` (text) - Path to service image
      - `display_order` (integer) - Default display order
      - `is_active` (boolean) - Whether card is in rotation pool
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `service_showcase_cards` table
    - Add policy for anonymous users to read active cards
    - Add policy for authenticated admin users to manage cards

  3. Indexes
    - Index on `is_active` for faster filtering
    - Index on `display_order` for sorting
*/

-- Create the service showcase cards table
CREATE TABLE IF NOT EXISTS service_showcase_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  service_slug text NOT NULL,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_showcase_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active cards
CREATE POLICY "Anyone can view active service showcase cards"
  ON service_showcase_cards
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage service showcase cards"
  ON service_showcase_cards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.deleted_at IS NULL
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_showcase_active ON service_showcase_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_service_showcase_order ON service_showcase_cards(display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_service_showcase_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_showcase_cards_updated_at
  BEFORE UPDATE ON service_showcase_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_service_showcase_cards_updated_at();