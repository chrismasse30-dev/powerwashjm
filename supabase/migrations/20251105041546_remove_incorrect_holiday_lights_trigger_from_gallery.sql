/*
  # Remove Incorrect Trigger from Holiday Gallery Photos
  
  1. Issue
    - The set_holiday_lights_status trigger is incorrectly attached to holiday_gallery_photos table
    - This trigger references requires_measurement column which doesn't exist in gallery table
    - It belongs only on the quote_submissions table
  
  2. Changes
    - Drop the trigger from holiday_gallery_photos table
    - Keep the trigger on quote_submissions table where it belongs
*/

-- Drop the incorrectly placed trigger
DROP TRIGGER IF EXISTS trigger_set_holiday_lights_status ON holiday_gallery_photos;
