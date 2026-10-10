/*
  # Add Brevo API Key to Site Settings

  1. Changes
    - Add `brevo_api_key` column to `site_settings` table to store Brevo/Sendinblue API key
    - Column is TEXT type to store the API key securely
    - This allows Edge Functions to read the key from database instead of environment variables
  
  2. Security
    - API key stored in database with existing RLS policies
    - Only authenticated users with proper access can view/modify
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'brevo_api_key'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN brevo_api_key TEXT;
  END IF;
END $$;