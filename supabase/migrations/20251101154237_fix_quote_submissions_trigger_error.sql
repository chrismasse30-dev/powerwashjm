/*
  # Fix Quote Submissions Update Error
  
  1. Problem
    - The trigger "trigger_set_holiday_lights_status" is incorrectly attached to quote_submissions
    - This function references display_order column which doesn't exist in quote_submissions
    - It should only be on holiday_gallery_photos table
    
  2. Solution
    - Remove the incorrectly placed trigger from quote_submissions
    - Keep it only on the appropriate table (holiday_gallery_photos)
    
  3. Impact
    - Allows email and other fields to be updated in quote_submissions
    - Fixes the "record 'new' has no field 'display_order'" error
*/

-- Remove the incorrectly placed trigger from quote_submissions
DROP TRIGGER IF EXISTS trigger_set_holiday_lights_status ON quote_submissions;

-- Verify the trigger still exists on the correct table (holiday_gallery_photos)
-- This is just a check - the trigger should already exist there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_set_holiday_lights_status' 
    AND tgrelid = 'holiday_gallery_photos'::regclass
  ) THEN
    -- If it doesn't exist, create it on the correct table
    CREATE TRIGGER trigger_set_holiday_lights_status
      BEFORE INSERT OR UPDATE ON holiday_gallery_photos
      FOR EACH ROW
      EXECUTE FUNCTION set_holiday_lights_status();
  END IF;
END $$;
