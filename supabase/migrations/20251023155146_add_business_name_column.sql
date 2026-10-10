/*
  # Add Business Name Column to Tables

  1. Changes
    - Add `business_name` column to `quote_submissions` table
    - Add `business_name` column to `newsletter_signups` table

  2. Details
    - Column type: text (optional/nullable)
    - Allows businesses to provide their company name
    - Supports both residential and commercial clients

  3. Notes
    - Field is optional and can be null
    - No default value required
    - Compatible with existing data
*/

-- Add business_name column to quote_submissions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'business_name'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN business_name text;
  END IF;
END $$;

-- Add business_name column to newsletter_signups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_signups' AND column_name = 'business_name'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN business_name text;
  END IF;
END $$;
