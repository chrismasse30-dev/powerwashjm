/*
  # Add Property Type and Package Columns

  1. Changes
    - Add property_type column for holiday lights property type
    - Add package column for holiday lights package selection
    - Add sq_ft column for property square footage

  2. Notes
    - These fields are optional and primarily used for holiday lights quotes
    - All fields are nullable since they don't apply to all service types
*/

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN property_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'package'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN package text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'sq_ft'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN sq_ft integer;
  END IF;
END $$;
