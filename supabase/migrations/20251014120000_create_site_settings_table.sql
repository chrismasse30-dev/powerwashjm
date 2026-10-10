/*
  # Create Site Settings Table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `setting_key` (text, unique) - Setting identifier (e.g., 'instant_estimate_visible')
      - `setting_value` (text) - Setting value (stored as JSON string if needed)
      - `description` (text) - Human-readable description of the setting
      - `updated_by` (text) - Email/identifier of user who last updated
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for authenticated users to update settings (admin only in practice)
    - Public users can read specific settings needed for site functionality

  3. Initial Data
    - Insert default setting for instant estimate visibility (enabled by default)

  4. Audit Logging
    - Track all changes to site settings
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can read all settings (they need to check visibility)
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can update settings
CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can insert settings
CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create audit log table for settings changes
CREATE TABLE IF NOT EXISTS site_settings_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  old_value text,
  new_value text NOT NULL,
  changed_by text NOT NULL,
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE site_settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read audit logs
CREATE POLICY "Authenticated users can read audit logs"
  ON site_settings_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
  ON site_settings_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_site_settings_timestamp_trigger ON site_settings;
CREATE TRIGGER update_site_settings_timestamp_trigger
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, description, updated_by)
VALUES
  ('instant_estimate_visible', 'true', 'Controls visibility of Instant Online Quote page to public visitors', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_audit_log_setting_key ON site_settings_audit_log(setting_key);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON site_settings_audit_log(changed_at DESC);
