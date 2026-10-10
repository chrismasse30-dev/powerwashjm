/*
  # Add City, State, and ZIP Code Columns

  1. Changes
    - Add `city` column to store city name
    - Add `state` column to store state abbreviation
    - Add `zip_code` column to store ZIP code

  2. Notes
    - These columns support the new separated address fields
    - All columns are nullable to support existing data
*/

-- Add city, state, and zip_code columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'city'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'state'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN zip_code text;
  END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN quote_submissions.address IS 'Street address only';
COMMENT ON COLUMN quote_submissions.city IS 'City name';
COMMENT ON COLUMN quote_submissions.state IS 'State abbreviation (e.g., MA, RI, CT)';
COMMENT ON COLUMN quote_submissions.zip_code IS 'ZIP code';
