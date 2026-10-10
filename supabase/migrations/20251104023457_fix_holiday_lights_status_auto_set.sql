/*
  # Fix Holiday Lights Status - Auto-set to "Needs Measure"

  ## Problem
  When new holiday light leads come in, they have:
  - status = "Draft" 
  - requires_measurement = true
  
  But they should have:
  - status = "Needs Measure"
  - requires_measurement = true

  ## Solution
  Create a trigger that automatically sets status to "Needs Measure" 
  when requires_measurement is true on new quotes.

  ## Changes
  1. Create function to auto-set status based on requires_measurement
  2. Create trigger to run before INSERT on quote_submissions
  3. Update existing holiday light quotes to correct status
*/

-- Create function to auto-set status for holiday light quotes
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If requires_measurement is true and status is Draft, change to Needs Measure
  IF NEW.requires_measurement = true AND NEW.status = 'Draft' THEN
    NEW.status := 'Needs Measure';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run before INSERT
DROP TRIGGER IF EXISTS set_holiday_lights_status_trigger ON quote_submissions;

CREATE TRIGGER set_holiday_lights_status_trigger
  BEFORE INSERT ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_holiday_lights_status();

-- Update existing holiday light quotes that are incorrectly marked as Draft
UPDATE quote_submissions
SET status = 'Needs Measure'
WHERE requires_measurement = true
AND status = 'Draft'
AND deleted = false;

-- Add comment
COMMENT ON FUNCTION set_holiday_lights_status() IS 
'Automatically sets status to "Needs Measure" for new quotes that require measurement (e.g., Holiday Lights)';
