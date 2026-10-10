/*
  # Fix Status Auto-Update - Preserve Manual Changes

  1. Problem
    - Status auto-updates to "Needs Measure" on EVERY UPDATE when requires_measurement = true
    - This prevents manual status changes like "Quoted" from being preserved
    - QuickMeasure tool sets status to "Quoted" after emailing customer, but trigger overrides it

  2. Solution
    - Only auto-set status during initial submission (draft → Submitted/Needs Measure)
    - Preserve manual status changes (like Quoted, Completed, Sold, etc.)
    - Allow manual override at any time

  3. Changes
    - Update set_holiday_lights_status() to only trigger on initial submission
    - Detect status changes and preserve them
    - Only override if status is draft or NULL during submission
*/

-- Update function to preserve manual status changes
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only auto-set status during initial submission or when status is unset
  -- This preserves manual status changes (like Quoted, Completed, Sold, etc.)

  IF TG_OP = 'INSERT' THEN
    -- On INSERT: Set initial status if not provided
    IF NEW.requires_measurement = true AND NEW.is_submitted = true THEN
      IF NEW.status IS NULL OR NEW.status = 'draft' THEN
        NEW.status := 'Needs Measure';
      END IF;
    ELSIF NEW.is_submitted = true THEN
      IF NEW.status IS NULL OR NEW.status = 'draft' THEN
        NEW.status := 'Submitted';
      END IF;
    ELSIF NEW.status IS NULL THEN
      NEW.status := 'draft';
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- On UPDATE: Only auto-set status if transitioning from draft/unsubmitted to submitted
    -- AND the status hasn't been manually changed

    -- Check if this is a fresh submission (going from draft to submitted)
    IF (OLD.is_submitted = false AND NEW.is_submitted = true) OR
       (OLD.status = 'draft' AND NEW.is_submitted = true) THEN
      -- This is an initial submission, set appropriate status
      IF NEW.requires_measurement = true THEN
        NEW.status := 'Needs Measure';
      ELSE
        NEW.status := 'Submitted';
      END IF;
    ELSE
      -- This is a regular update, preserve any manual status change
      -- If the status was explicitly changed in this update, keep it
      -- Only override if requires_measurement changed AND status is still at initial state
      IF OLD.requires_measurement != NEW.requires_measurement AND
         NEW.status IN ('draft', 'Submitted', 'Needs Measure') THEN
        -- Measurement requirement changed, update status appropriately
        IF NEW.requires_measurement = true THEN
          NEW.status := 'Needs Measure';
        ELSIF NEW.status = 'Needs Measure' THEN
          NEW.status := 'Submitted';
        END IF;
      END IF;
      -- Otherwise, preserve the current status (including manual changes)
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Note: Trigger already exists from previous migrations
-- The function update will automatically apply to the existing trigger

-- Add comment explaining the trigger behavior
COMMENT ON FUNCTION set_holiday_lights_status() IS
'Auto-sets status during initial form submission. Preserves manual status changes like Quoted, Completed, Sold. Only overrides status when transitioning from draft to submitted or when measurement requirement changes on initial statuses.';
