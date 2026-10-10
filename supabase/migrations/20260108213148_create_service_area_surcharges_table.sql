/*
  # Service Area Trip Surcharge System

  ## Overview
  Creates a hidden distance-based pricing surcharge system for the instant estimator.
  This allows administrators to configure automatic price adjustments based on
  customer distance from a base zip code, without exposing this information to end users.

  ## New Tables
  - `service_area_surcharges`
    - `id` (uuid, primary key)
    - `base_zip_code` (text) - The origin zip code for distance calculations
    - `distance_from` (integer) - Starting mile range (inclusive)
    - `distance_to` (integer) - Ending mile range (inclusive)
    - `surcharge_amount` (numeric) - Dollar amount to add to quote
    - `active` (boolean) - Whether this surcharge range is active
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `quote_surcharge_audit`
    - `id` (uuid, primary key)
    - `quote_submission_id` (uuid) - FK to quote_submissions
    - `customer_zip_code` (text) - Customer's zip code
    - `base_zip_code` (text) - Base zip code used for calculation
    - `calculated_distance` (numeric) - Distance in miles
    - `surcharge_applied` (numeric) - Dollar amount added
    - `surcharge_rule_id` (uuid) - FK to service_area_surcharges
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated users with admin role can manage surcharges
  - Audit log is admin-only accessible
  - No public read access to prevent exposure to end users
*/

-- Create service_area_surcharges table
CREATE TABLE IF NOT EXISTS service_area_surcharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_zip_code text NOT NULL DEFAULT '02919',
  distance_from integer NOT NULL,
  distance_to integer NOT NULL,
  surcharge_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure valid distance ranges
  CONSTRAINT valid_distance_range CHECK (distance_from >= 0 AND distance_to > distance_from),
  CONSTRAINT valid_surcharge CHECK (surcharge_amount >= 0)
);

-- Create quote_surcharge_audit table
CREATE TABLE IF NOT EXISTS quote_surcharge_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_submission_id uuid REFERENCES quote_submissions(id) ON DELETE SET NULL,
  customer_zip_code text NOT NULL,
  base_zip_code text NOT NULL,
  calculated_distance numeric(10,2),
  surcharge_applied numeric(10,2) NOT NULL DEFAULT 0.00,
  surcharge_rule_id uuid REFERENCES service_area_surcharges(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_area_surcharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_surcharge_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_area_surcharges (admin-only access)
CREATE POLICY "Admins can view surcharges"
  ON service_area_surcharges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can insert surcharges"
  ON service_area_surcharges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can update surcharges"
  ON service_area_surcharges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can delete surcharges"
  ON service_area_surcharges FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
    )
  );

-- RLS Policies for quote_surcharge_audit (admin-only access)
CREATE POLICY "Admins can view surcharge audit"
  ON quote_surcharge_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Service can insert audit records"
  ON quote_surcharge_audit FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_area_surcharges_active ON service_area_surcharges(active);
CREATE INDEX IF NOT EXISTS idx_service_area_surcharges_distance ON service_area_surcharges(distance_from, distance_to);
CREATE INDEX IF NOT EXISTS idx_quote_surcharge_audit_quote_id ON quote_surcharge_audit(quote_submission_id);
CREATE INDEX IF NOT EXISTS idx_quote_surcharge_audit_created_at ON quote_surcharge_audit(created_at DESC);

-- Create updated_at trigger for service_area_surcharges
CREATE TRIGGER update_service_area_surcharges_updated_at
  BEFORE UPDATE ON service_area_surcharges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default surcharge ranges
INSERT INTO service_area_surcharges (distance_from, distance_to, surcharge_amount, active) VALUES
  (0, 10, 0.00, true),
  (10, 15, 25.00, true),
  (15, 20, 50.00, true),
  (20, 25, 75.00, true),
  (25, 30, 100.00, true),
  (30, 35, 125.00, true),
  (35, 40, 150.00, true),
  (40, 45, 175.00, true),
  (45, 50, 200.00, true)
ON CONFLICT DO NOTHING;