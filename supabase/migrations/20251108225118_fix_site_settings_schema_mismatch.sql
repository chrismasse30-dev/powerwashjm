/*
  # Fix Site Settings Schema Mismatch

  ## Problem
  The site_settings table was created with wrong column names:
  - Has: key, value (jsonb)
  - Needs: setting_key, setting_value (text), updated_by

  ## Solution
  Drop and recreate with correct schema matching the application code

  ## Changes
  1. Drop existing tables
  2. Recreate with correct schema
  3. Re-enable RLS
  4. Insert initial settings
*/

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS site_settings_audit_log CASCADE;

-- Create site_settings table with CORRECT schema
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit log table
CREATE TABLE site_settings_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  old_value text,
  new_value text NOT NULL,
  changed_by text NOT NULL,
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Authenticated users can view settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for audit log
CREATE POLICY "Authenticated users can view audit log"
  ON site_settings_audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit log"
  ON site_settings_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial settings
INSERT INTO site_settings (setting_key, setting_value, description, updated_by)
VALUES 
  (
    'notifications_enabled',
    'true',
    'Master toggle for quote submission processing. When OFF, blocks all submissions.',
    'system'
  ),
  (
    'instant_estimate_visible',
    'true',
    'Controls public visibility of Instant Online Quote page.',
    'system'
  );

-- Create indexes
CREATE INDEX idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX idx_audit_log_setting_key ON site_settings_audit_log(setting_key, changed_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();
