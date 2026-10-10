/*
  # Add Measurement Workflow Tracking

  1. Changes
    - Add `requires_measurement` column to quote_submissions table
      - Boolean field to track quotes that need design/measurement work
      - Default false for most services
      - Will be set true for Holiday Lights quotes
    
  2. Purpose
    - Enable design team to start work on quotes before customer finalizes
    - Maintain customer-facing submission status (is_submitted)
    - Separate internal workflow tracking from customer experience
    - QuickMeasure dropdown will filter by this flag instead of is_submitted
    
  3. Benefits
    - Customer sees their quote as "Submitted" (confirmation emails sent)
    - Design team can immediately see quotes needing measurement
    - No disruption to existing workflow
    - Clean separation of concerns
*/

-- Add requires_measurement column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' 
    AND column_name = 'requires_measurement'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN requires_measurement boolean DEFAULT false;
  END IF;
END $$;

-- Create index for faster filtering in QuickMeasure dropdown
CREATE INDEX IF NOT EXISTS idx_quote_submissions_requires_measurement 
ON quote_submissions(requires_measurement) 
WHERE requires_measurement = true AND deleted = false;

-- Set all existing Holiday Lights quotes to require measurement
UPDATE quote_submissions
SET requires_measurement = true
WHERE 'Holiday Lights' = ANY(services)
  AND deleted = false
  AND is_submitted = true;