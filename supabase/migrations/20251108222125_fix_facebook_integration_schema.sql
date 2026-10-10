/*
  # Fix Facebook Integration Schema

  1. Changes to facebook_post_logs
    - Add missing created_at column
    - Add missing updated_at column
    
  2. Changes to facebook_settings
    - Remove duplicate columns (old structure had both page_id and facebook_page_id)
    - Standardize on the newer column names
    
  3. Security
    - Maintains existing RLS policies
*/

-- Add created_at and updated_at to facebook_post_logs if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_post_logs' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE facebook_post_logs ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_post_logs' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE facebook_post_logs ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Drop redundant old columns from facebook_settings if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_settings' AND column_name = 'page_id'
  ) THEN
    -- Only drop if facebook_page_id exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'facebook_settings' AND column_name = 'facebook_page_id'
    ) THEN
      ALTER TABLE facebook_settings DROP COLUMN IF EXISTS page_id;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_settings' AND column_name = 'page_name'
  ) THEN
    ALTER TABLE facebook_settings DROP COLUMN IF EXISTS page_name;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_settings' AND column_name = 'access_token'
  ) THEN
    -- Only drop if page_access_token exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'facebook_settings' AND column_name = 'page_access_token'
    ) THEN
      ALTER TABLE facebook_settings DROP COLUMN IF EXISTS access_token;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facebook_settings' AND column_name = 'auto_post_enabled'
  ) THEN
    -- Only drop if is_enabled exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'facebook_settings' AND column_name = 'is_enabled'
    ) THEN
      ALTER TABLE facebook_settings DROP COLUMN IF EXISTS auto_post_enabled;
    END IF;
  END IF;
END $$;