/*
  # Add design_saved_at column to quote_submissions

  1. Changes
    - Add design_saved_at timestamp column to track when design was last saved
    - This enables the QuickMeasure page to check if a design exists before saving
  
  2. Notes
    - Column is nullable since existing records don't have this timestamp
    - Will be set automatically when designs are saved in QuickMeasure
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'design_saved_at'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN design_saved_at timestamptz;
  END IF;
END $$;
