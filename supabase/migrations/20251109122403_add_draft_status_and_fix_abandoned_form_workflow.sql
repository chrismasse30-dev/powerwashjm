/*
  # Fix Abandoned Form Workflow - Add Draft Status

  1. Schema Changes
    - Add "draft" as a valid status option for quote_submissions
    - Ensure abandoned form workflow uses status field properly
    - Keep existing statuses: Submitted, Needs Measure, Measured, Quoted, Completed, Sold, Lost

  2. Status Workflow
    - Form started (not submitted) → "draft"
    - Form submitted (Holiday Lights) → "Needs Measure"
    - Form submitted (Other services) → "Submitted"
    - After 30 minutes of draft → Send abandoned email

  3. Security
    - Maintain existing RLS policies
    - No breaking changes to existing data
*/

-- Drop existing status constraint
ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check;
ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check1;
ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check2;

-- Add new constraint that includes "draft" status
ALTER TABLE quote_submissions
ADD CONSTRAINT quote_submissions_status_check 
CHECK (status IN (
  'draft',          -- New: Form started but not submitted
  'Submitted',      -- Form submitted (non-holiday)
  'Needs Measure',  -- Holiday lights or requires measurement
  'Measured',       -- Measurement completed
  'Quoted',         -- Quote provided
  'Completed',      -- Job completed
  'Sold',           -- Sale closed
  'Lost'            -- Customer declined
));

-- Update default status to 'draft' for new records
-- This will be overridden when form is actually submitted
ALTER TABLE quote_submissions 
ALTER COLUMN status SET DEFAULT 'draft';

-- Update the holiday lights trigger to handle draft → Needs Measure transition
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Auto-set status when requires_measurement is true (Holiday Lights)
  IF NEW.requires_measurement = true AND NEW.is_submitted = true THEN
    -- When form is actually submitted, change from draft to Needs Measure
    NEW.status := 'Needs Measure';
  ELSIF NEW.requires_measurement = false AND NEW.is_submitted = true THEN
    -- When form is submitted without measurement requirement
    IF NEW.status = 'draft' OR NEW.status IS NULL THEN
      NEW.status := 'Submitted';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS set_holiday_lights_status_trigger ON quote_submissions;
CREATE TRIGGER set_holiday_lights_status_trigger
  BEFORE INSERT OR UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_holiday_lights_status();

-- Create index for efficient abandoned form queries
CREATE INDEX IF NOT EXISTS idx_quote_submissions_draft_created 
  ON quote_submissions(created_at) 
  WHERE status = 'draft' AND deleted = false AND abandoned_email_sent = false;