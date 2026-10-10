/*
  # Fix Status Column - Allow Manual Overrides

  1. Problem
    - The trigger `set_holiday_lights_status()` was forcing status to "Needs Measure" on EVERY update
    - This prevented users from manually changing status from "Needs Measure" to "Quoted" or other statuses
    - The trigger was checking requires_measurement without considering if status was already manually set

  2. Solution
    - Update trigger to ONLY auto-set status when transitioning from draft/NULL to submitted
    - Allow manual status changes to be preserved
    - Only override status if it's in an "initial" state (draft, NULL, or Submitted)

  3. Changes
    - Modified set_holiday_lights_status() function to respect manual status changes
    - Trigger now only sets status automatically during initial submission
    - Manual changes to status (like changing to "Quoted") will be preserved
*/

-- Update function to allow manual status overrides
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only auto-set status if we're in an initial/unprocessed state
  -- This allows manual status changes to be preserved
  
  IF TG_OP = 'INSERT' THEN
    -- On INSERT: Set initial status based on requirements
    IF NEW.requires_measurement = true AND NEW.is_submitted = true THEN
      NEW.status := 'Needs Measure';
    ELSIF NEW.is_submitted = true THEN
      IF NEW.status IS NULL OR NEW.status = 'draft' THEN
        NEW.status := 'Submitted';
      END IF;
    ELSIF NEW.status IS NULL THEN
      NEW.status := 'draft';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- On UPDATE: Only auto-set status if transitioning from draft to submitted
    -- This preserves manual status changes like "Needs Measure" → "Quoted"
    IF OLD.is_submitted = false AND NEW.is_submitted = true THEN
      -- Form just got submitted, set initial status
      IF NEW.requires_measurement = true THEN
        NEW.status := 'Needs Measure';
      ELSE
        NEW.status := 'Submitted';
      END IF;
    ELSIF OLD.status = 'draft' AND NEW.is_submitted = true THEN
      -- Transitioning from draft to submitted
      IF NEW.requires_measurement = true THEN
        NEW.status := 'Needs Measure';
      ELSE
        NEW.status := 'Submitted';
      END IF;
    END IF;
    -- Otherwise, preserve the status (allows manual overrides)
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: Trigger already exists, function update is sufficient
-- The existing trigger will use the updated function automatically
