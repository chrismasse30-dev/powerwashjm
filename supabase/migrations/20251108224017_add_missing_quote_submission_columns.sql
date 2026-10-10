/*
  # Add Missing Quote Submission Columns

  1. Changes
    - Add `ip_city` column to store city from IP geolocation
    - Add `ip_state` column to store state from IP geolocation
    - Rename `zip` to `zip_code` for consistency (or add `zip_code` as alias)

  2. Notes
    - These columns are needed for proper quote tracking
    - IP location data helps with regional analytics
*/

-- Add ip_city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_submissions' AND column_name = 'ip_city'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN ip_city text;
    COMMENT ON COLUMN quote_submissions.ip_city IS 'City from IP geolocation';
  END IF;
END $$;

-- Add ip_state column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_submissions' AND column_name = 'ip_state'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN ip_state text;
    COMMENT ON COLUMN quote_submissions.ip_state IS 'State from IP geolocation';
  END IF;
END $$;