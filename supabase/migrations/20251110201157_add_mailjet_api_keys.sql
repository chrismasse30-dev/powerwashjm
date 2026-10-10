/*
  # Add MailJet API Keys to Site Settings

  1. Changes
    - Adds mailjet_api_key setting for MailJet API Key
    - Adds mailjet_secret_key setting for MailJet Secret Key
    - These keys provide transactional email delivery
  
  2. Notes
    - MailJet replaces Web3Forms as primary email fallback
    - Get keys from: https://app.mailjet.com/account/apikeys
    - Both API Key and Secret Key required for authentication
    - Keys can be updated via update-mailjet-keys.mjs script
*/

-- Add MailJet API Key setting
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'mailjet_api_key',
  'NOT_CONFIGURED',
  'MailJet API Key for transactional emails. Get from https://app.mailjet.com/account/apikeys'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add MailJet Secret Key setting
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'mailjet_secret_key',
  'NOT_CONFIGURED',
  'MailJet Secret Key for transactional emails. Get from https://app.mailjet.com/account/apikeys'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE site_settings IS 'Stores application-wide settings including API keys. Email service priority: Brevo SMTP → MailJet → Web3Forms';
