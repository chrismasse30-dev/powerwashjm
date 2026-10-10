/*
  # Create Site Settings Table and Notifications Toggle

  ## Overview
  This migration creates the site_settings system for managing global site configurations,
  including the quote submissions notifications toggle for testing environments.

  ## New Tables
  
  ### `site_settings`
  - `id` (uuid, primary key)
  - `setting_key` (text, unique) - The unique identifier for the setting
  - `setting_value` (text) - The value of the setting
  - `description` (text, nullable) - Human-readable description
  - `updated_by` (text, nullable) - Email of user who last updated
  - `created_at` (timestamptz) - When setting was created
  - `updated_at` (timestamptz) - When setting was last updated

  ### `site_settings_audit_log`
  - `id` (uuid, primary key)
  - `setting_key` (text) - Which setting was changed
  - `old_value` (text, nullable) - Previous value
  - `new_value` (text) - New value
  - `changed_by` (text) - Email of user who made change
  - `changed_at` (timestamptz) - When change occurred
  - `ip_address` (text, nullable) - IP of user who made change
  - `user_agent` (text, nullable) - Browser info

  ## Initial Settings

  ### 1. `notifications_enabled`
  - **Purpose**: Master switch for quote submission processing
  - **Values**: 'true' | 'false'
  - **Default**: 'true' (enabled)
  - **When OFF**: Completely blocks all quote submission processing including:
    - Database storage (no records created in quote_submissions table)
    - Email notifications (no emails sent)
    - Webhook notifications (no external calls)
    - Newsletter signups (no MailChimp syncs)
    - Analytics tracking for submissions
  - **Use Case**: Testing environment - prevents test submissions from polluting production data

  ### 2. `instant_estimate_visible`
  - **Purpose**: Controls public visibility of Instant Quote page
  - **Values**: 'true' | 'false'
  - **Default**: 'true' (visible)
  - **When OFF**: Public visitors redirected to homepage (admins still have access)

  ## Security
  - Enable RLS on both tables
  - Only authenticated users can view settings
  - Only authenticated users can modify settings (admins should be enforced at app level)
  - Full audit trail of all changes

  ## Important Notes
  - The `notifications_enabled` toggle is specifically for TESTING purposes
  - When disabled, it completely blocks the submission pipeline
  - This is NOT a temporary disable - it stays off until manually re-enabled
  - Always verify setting is 'true' before going live
  - Check audit log to see who changed critical settings
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

-- Create audit log table
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
    'Master toggle for quote submission processing. When OFF, completely blocks all submissions from being stored in database and sending notifications. FOR TESTING ONLY.',
    'system'
  ),
  (
    'instant_estimate_visible',
    'true',
    'Controls public visibility of Instant Online Quote page. When OFF, public visitors are redirected to homepage (admins retain access).',
    'system'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_audit_log_setting_key ON site_settings_audit_log(setting_key, changed_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();
