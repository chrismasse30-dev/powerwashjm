/*
  # Add Missing Facebook Settings Columns

  1. Changes
    - Add facebook_page_id column (stores Facebook Page ID)
    - Add facebook_app_id column (stores Facebook App ID)
    - Add facebook_app_secret column (stores Facebook App Secret)
    - Add page_access_token column (stores long-lived page access token)
    - Add is_enabled column (boolean to enable/disable auto-posting)
    - Add last_token_refresh column (timestamp of last token refresh)

  2. Notes
    - These columns are required by the FacebookSettingsPage UI
    - Existing columns (page_id, page_name, access_token) will be deprecated in favor of new columns
*/

-- Add missing columns to facebook_settings table
ALTER TABLE facebook_settings
ADD COLUMN IF NOT EXISTS facebook_page_id TEXT,
ADD COLUMN IF NOT EXISTS facebook_app_id TEXT,
ADD COLUMN IF NOT EXISTS facebook_app_secret TEXT,
ADD COLUMN IF NOT EXISTS page_access_token TEXT,
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_token_refresh TIMESTAMPTZ;

-- Copy data from old columns to new columns if they exist
UPDATE facebook_settings
SET 
  facebook_page_id = COALESCE(facebook_page_id, page_id),
  page_access_token = COALESCE(page_access_token, access_token),
  is_enabled = COALESCE(is_enabled, auto_post_enabled)
WHERE facebook_page_id IS NULL OR page_access_token IS NULL;

-- Add comments
COMMENT ON COLUMN facebook_settings.facebook_page_id IS 'Facebook Page ID (e.g., 430347003969301)';
COMMENT ON COLUMN facebook_settings.facebook_app_id IS 'Facebook App ID (e.g., 1670055597300242)';
COMMENT ON COLUMN facebook_settings.facebook_app_secret IS 'Facebook App Secret (encrypted)';
COMMENT ON COLUMN facebook_settings.page_access_token IS 'Long-lived Page Access Token';
COMMENT ON COLUMN facebook_settings.is_enabled IS 'Whether auto-posting to Facebook is enabled';
COMMENT ON COLUMN facebook_settings.last_token_refresh IS 'Timestamp of last token refresh';
