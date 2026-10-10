/*
  # Remove Temporary Migration Policy

  1. Changes
    - Remove temporary anonymous insert policy
    - Restore proper security after data migration

  2. Security
    - Removes the temporary migration policy
    - Gallery remains secure with existing authenticated policies
*/

-- Remove the temporary migration policy
DROP POLICY IF EXISTS "Temporary migration insert policy" ON holiday_gallery_photos;