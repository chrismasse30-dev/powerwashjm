/*
  # Add design_data JSON column for editable designs

  1. Changes
    - Add `design_data` JSONB column to `quote_submissions` table
    - This will store the complete design state including:
      - Measurements (house, tree, power cord measurements)
      - Photos (image URLs and metadata)
      - Manual inputs
      - Calibration data
      - Line colors and styles
      - Project narrative/notes
      - All other QuickMeasure tool state
    
  2. Purpose
    - Enable "View Design" button to reopen designs in QuickMeasure tool
    - Allow full editing of saved designs
    - Preserve all design elements for modification
    
  3. Notes
    - Uses JSONB for efficient querying and indexing
    - Nullable to maintain backward compatibility with existing records
*/

-- Add design_data column to store complete design state
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'design_data'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN design_data JSONB DEFAULT NULL;
    
    -- Add index for efficient JSON queries
    CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_data 
    ON quote_submissions USING GIN (design_data);
  END IF;
END $$;