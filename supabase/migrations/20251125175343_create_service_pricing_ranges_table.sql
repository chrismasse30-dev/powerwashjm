/*
  # Create Service Pricing Ranges Table

  1. New Table
    - `service_pricing_ranges`
      - `id` (uuid, primary key)
      - `service_type` (text) - e.g., 'roof-cleaning', 'house-washing'
      - `service_name` (text) - Display name
      - `min_price` (integer) - Minimum price in dollars
      - `max_price` (integer) - Maximum price in dollars (increased by 15% for instant quote range)
      - `description` (text) - Optional description
      - `display_order` (integer) - Order to display services
      - `active` (boolean) - Whether to show this service
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access (needed for town pages)
    - Admin-only write access

  3. Initial Data
    - Populate with 6 main services
    - Min prices based on current data
    - Max prices increased by 15% and rounded
*/

-- Create the table
CREATE TABLE IF NOT EXISTS service_pricing_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL UNIQUE,
  service_name text NOT NULL,
  min_price integer NOT NULL CHECK (min_price > 0),
  max_price integer NOT NULL CHECK (max_price >= min_price),
  description text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_pricing_ranges ENABLE ROW LEVEL SECURITY;

-- Public can read active pricing
CREATE POLICY "Anyone can view active pricing"
  ON service_pricing_ranges
  FOR SELECT
  USING (active = true);

-- Only authenticated users (admins) can insert
CREATE POLICY "Authenticated users can insert pricing"
  ON service_pricing_ranges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can update
CREATE POLICY "Authenticated users can update pricing"
  ON service_pricing_ranges
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can delete
CREATE POLICY "Authenticated users can delete pricing"
  ON service_pricing_ranges
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_pricing_type 
  ON service_pricing_ranges(service_type);

CREATE INDEX IF NOT EXISTS idx_service_pricing_active 
  ON service_pricing_ranges(active, display_order);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_service_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_service_pricing_ranges_updated_at
  BEFORE UPDATE ON service_pricing_ranges
  FOR EACH ROW
  EXECUTE FUNCTION update_service_pricing_updated_at();

-- Insert initial pricing data (15% increase on max, rounded)
-- Original ranges from removed allServicesData.tsx:
-- House Washing: 349-799 → 349-919 (799 * 1.15 = 918.85)
-- Roof Cleaning: 499-999 → 499-1149 (999 * 1.15 = 1148.85)
-- Gutter Cleaning: 149-399 → 149-459 (399 * 1.15 = 458.85)
-- Deck/Concrete/Holiday - estimated ranges with 15% increase

INSERT INTO service_pricing_ranges (service_type, service_name, min_price, max_price, description, display_order, active)
VALUES
  ('roof-cleaning', 'Roof Cleaning', 499, 1149, 'Soft wash roof cleaning to remove algae, moss, and black streaks', 1, true),
  ('house-washing', 'House Washing', 349, 919, 'Professional soft washing for all siding types', 2, true),
  ('deck-cleaning', 'Deck Restoration', 299, 804, 'Deck cleaning, restoration, and optional staining', 3, true),
  ('gutter-cleaning', 'Gutter Cleaning', 149, 459, 'Complete interior and exterior gutter cleaning', 4, true),
  ('concrete-cleaning', 'Concrete Cleaning', 199, 574, 'Driveway, walkway, and patio cleaning', 5, true),
  ('holiday-lights', 'Holiday Lights', 499, 3449, 'Professional installation, maintenance, and removal', 6, true)
ON CONFLICT (service_type) DO UPDATE SET
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;

-- Add comment
COMMENT ON TABLE service_pricing_ranges IS 'Service pricing ranges displayed on town pages and used for instant quote tool';
