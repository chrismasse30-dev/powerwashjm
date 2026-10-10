/*
  # Add Sales Rep Column to Quote Submissions

  1. Changes
    - Add `sales_rep` column to `quote_submissions` table
    - Default value: 'Chris M'
    - Allows tracking which sales representative is handling each quote

  2. Notes
    - Nullable field to support historical records without sales rep data
    - Can be updated by QuickMeasure tool when saving designs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'sales_rep'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN sales_rep text DEFAULT 'Chris M';
  END IF;
END $$;