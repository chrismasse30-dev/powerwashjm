/*
  # Add Brevo SMTP Key to Site Settings

  1. Changes
    - Adds brevo_smtp_key setting to site_settings table
    - This provides an alternative to the old BREVO_API_KEY environment variable
    - Allows for easier key rotation without redeploying edge functions
  
  2. Notes
    - Email functions will check this key first before falling back to environment variable
    - Key should start with xsmtpsib- or xkeysib-
    - Store the full key value in setting_value column
*/

-- Add brevo_smtp_key setting (set to placeholder initially)
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'brevo_smtp_key',
  'NOT_CONFIGURED',
  'Brevo SMTP API key for transactional emails. Get from https://app.brevo.com/settings/keys/smtp'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add a comment for documentation
COMMENT ON TABLE site_settings IS 'Stores application-wide settings including API keys. Keys stored here take precedence over environment variables for easier rotation.';
