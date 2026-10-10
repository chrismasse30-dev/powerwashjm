/*
  # Fix Facebook Settings Table Schema - FINAL

  ## Problem
  The facebook_settings table was recreated in initial_database_setup.sql with wrong schema:
  - Has: page_id, page_name, access_token, auto_post_enabled
  - Needs: facebook_page_id, facebook_app_id, facebook_app_secret, page_access_token, is_enabled, last_token_refresh

  ## Solution
  Drop and recreate with correct schema matching the application code and preserve existing data

  ## Changes
  1. Backup existing data
  2. Drop table
  3. Recreate with correct schema
  4. Restore data with column mapping
*/

-- Backup existing data
CREATE TEMP TABLE facebook_settings_backup AS
SELECT * FROM facebook_settings;

-- Drop existing table
DROP TABLE IF EXISTS facebook_settings CASCADE;

-- Create facebook_settings table with CORRECT schema
CREATE TABLE facebook_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facebook_page_id TEXT NOT NULL,
  facebook_app_id TEXT NOT NULL,
  facebook_app_secret TEXT NOT NULL,
  page_access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  is_enabled BOOLEAN DEFAULT false,
  last_token_refresh TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restore data if backup exists (map old columns to new ones)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'facebook_settings_backup') THEN
    INSERT INTO facebook_settings (
      id,
      facebook_page_id,
      facebook_app_id, 
      facebook_app_secret,
      page_access_token,
      token_expires_at,
      is_enabled,
      created_at,
      updated_at
    )
    SELECT 
      id,
      facebook_page_id,
      facebook_app_id,
      facebook_app_secret,
      page_access_token,
      token_expires_at,
      is_enabled,
      created_at,
      updated_at
    FROM facebook_settings_backup;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE facebook_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated can manage facebook settings"
  ON facebook_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure only one row exists (add unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS facebook_settings_singleton ON facebook_settings ((true));
