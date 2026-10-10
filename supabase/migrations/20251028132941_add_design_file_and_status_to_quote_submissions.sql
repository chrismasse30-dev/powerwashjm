/*
  # Add Design File and Status Fields to Quote Submissions

  1. Changes
    - Add `design_file_url` TEXT column to store QuickMeasure design file links
    - Add `status` TEXT column with predefined values (Draft, Submitted, Needs Measure, Measured, Quoted, Approved, Completed)
    - Add `design_saved_at` TIMESTAMPTZ column to track when design was saved
    - Add `design_saved_by` TEXT column to track who saved the design
    - Create index on status for efficient filtering
    - Set default status to 'Submitted' for backward compatibility
    - Add trigger to auto-set 'Needs Measure' for Holiday Lights submissions

  2. Security
    - RLS policies inherit from existing quote_submissions table policies
    - Design files stored as URLs (actual files in measurement-designs bucket)

  3. Audit Trail
    - design_saved_at: Timestamp when design was linked
    - design_saved_by: Email/name of user who saved the design
*/

-- Add design_file_url column to store the link to QuickMeasure designs
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS design_file_url TEXT;

-- Add status column with predefined values
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Submitted' CHECK (
  status IN ('Draft', 'Submitted', 'Needs Measure', 'Measured', 'Quoted', 'Approved', 'Completed')
);

-- Add audit trail columns for design file tracking
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS design_saved_at TIMESTAMPTZ;

ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS design_saved_by TEXT;

-- Create index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_status ON quote_submissions(status);

-- Create index on design_file_url to quickly find submissions with designs
CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_file ON quote_submissions(design_file_url) 
WHERE design_file_url IS NOT NULL;

-- Update existing submissions to have 'Submitted' status if they are marked as submitted
UPDATE quote_submissions 
SET status = 'Submitted'
WHERE is_submitted = true AND status IS NULL;

-- Update existing draft submissions to have 'Draft' status
UPDATE quote_submissions 
SET status = 'Draft'
WHERE (is_submitted = false OR is_submitted IS NULL) AND status IS NULL;

-- Create function to auto-set status for Holiday Lights submissions
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a Holiday Lights submission
  IF NEW.property_type = 'holiday-lights' OR 
     'Holiday Lights' = ANY(NEW.services) OR
     'Holiday Light Installation' = ANY(NEW.services) THEN
    -- Set status to 'Needs Measure' if not already set
    IF NEW.status IS NULL OR NEW.status = 'Draft' THEN
      NEW.status := 'Needs Measure';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_set_holiday_lights_status ON quote_submissions;
CREATE TRIGGER trigger_set_holiday_lights_status
  BEFORE INSERT OR UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_holiday_lights_status();