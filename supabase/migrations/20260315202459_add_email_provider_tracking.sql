/*
  # Add Email Provider Tracking to Quote Submissions

  1. Changes
    - Add `form_confirmation_provider` column to track which email service successfully sent the confirmation
    - Add columns for fallback API keys (resend_api_key, sendgrid_api_key) to site_settings
  
  2. Purpose
    - Track which email provider (MailJet, Brevo, Resend, SendGrid) successfully sent each confirmation email
    - Enable multi-provider fallback system for reliable email delivery
    - Provide visibility into which backup systems are being used when primary fails
*/

-- Add provider tracking column to quote_submissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_submissions' 
    AND column_name = 'form_confirmation_provider'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN form_confirmation_provider text;
    
    COMMENT ON COLUMN quote_submissions.form_confirmation_provider IS 'Email provider used to send confirmation (MailJet, Brevo, Resend, SendGrid)';
  END IF;
END $$;

-- Add API key settings for fallback email providers if they don't exist
DO $$
BEGIN
  -- Resend API key
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'resend_api_key'
  ) THEN
    INSERT INTO site_settings (setting_key, setting_value, description)
    VALUES ('resend_api_key', 'NOT_CONFIGURED', 'Resend API key for email fallback');
  END IF;

  -- SendGrid API key
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'sendgrid_api_key'
  ) THEN
    INSERT INTO site_settings (setting_key, setting_value, description)
    VALUES ('sendgrid_api_key', 'NOT_CONFIGURED', 'SendGrid API key for email fallback');
  END IF;
END $$;
