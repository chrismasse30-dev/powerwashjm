/*
  # Fix Holiday Lights Status - Handle INSERT and UPDATE

  ## Problem
  Holiday light quotes need to automatically get status "Needs Measure" when:
  1. A new quote is created (INSERT)
  2. A draft is updated to submitted (UPDATE)
  3. requires_measurement is set to true

  ## Solution
  Update trigger to handle both INSERT and UPDATE operations
  and automatically set the correct status.

  ## Changes
  1. Drop old INSERT-only trigger
  2. Create new trigger that runs on both INSERT and UPDATE
  3. Fix any remaining quotes with wrong status
*/

-- Drop old trigger
DROP TRIGGER IF EXISTS set_holiday_lights_status_trigger ON quote_submissions;

-- Update function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-set status to "Needs Measure" when requires_measurement is true
  -- This happens for Holiday Lights quotes
  IF NEW.requires_measurement = true THEN
    -- If status is Draft or NULL, change to Needs Measure
    IF NEW.status = 'Draft' OR NEW.status IS NULL THEN
      NEW.status := 'Needs Measure';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for both INSERT and UPDATE
CREATE TRIGGER set_holiday_lights_status_trigger
  BEFORE INSERT OR UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_holiday_lights_status();

-- Fix all existing quotes that have wrong status
UPDATE quote_submissions
SET status = 'Needs Measure'
WHERE requires_measurement = true
AND status IN ('Draft', 'Incomplete')
AND deleted = false
AND status != 'Measured'  -- Don't change if already measured
AND status != 'Sent'      -- Don't change if quote already sent
AND status != 'Approved'  -- Don't change if already approved
AND status != 'Completed'; -- Don't change if completed

-- Verify the fix
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fixed_count
  FROM quote_submissions
  WHERE requires_measurement = true
  AND status = 'Needs Measure'
  AND deleted = false;
  
  RAISE NOTICE '✅ Fixed holiday light quotes. % quotes now have correct "Needs Measure" status', fixed_count;
END $$;
