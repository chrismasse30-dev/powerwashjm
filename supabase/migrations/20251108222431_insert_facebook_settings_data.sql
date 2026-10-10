/*
  # Insert Facebook Settings Configuration

  1. Data
    - Insert Facebook integration settings with provided credentials
    - Set auto-posting to enabled
    - Configure token expiration for 45 days

  2. Notes
    - Page Access Token will need to be added via admin UI
    - Token expires in 45 days as shown in screenshot
*/

-- Insert or update Facebook settings
INSERT INTO facebook_settings (
  facebook_page_id,
  facebook_app_id,
  facebook_app_secret,
  page_access_token,
  is_enabled,
  token_expires_at
) VALUES (
  '430347003969301',
  '1670055597300242',
  '843c416f1aa87400c8ed0c25742fd7d8',
  '',
  true,
  NOW() + INTERVAL '45 days'
)
ON CONFLICT (id) DO UPDATE SET
  facebook_page_id = EXCLUDED.facebook_page_id,
  facebook_app_id = EXCLUDED.facebook_app_id,
  facebook_app_secret = EXCLUDED.facebook_app_secret,
  is_enabled = EXCLUDED.is_enabled,
  token_expires_at = EXCLUDED.token_expires_at,
  updated_at = NOW();