/*
  # Add design_saved_by column to quote_submissions

  1. Changes
    - Add design_saved_by column to track who saved the design
    - Column is nullable UUID referencing users table

  2. Security
    - No RLS changes needed - inherits existing policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'design_saved_by'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN design_saved_by UUID REFERENCES users(id);
  END IF;
END $$;