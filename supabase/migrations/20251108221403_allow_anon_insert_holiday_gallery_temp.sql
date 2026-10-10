/*
  # Temporarily Allow Anonymous Inserts for Data Migration

  1. Changes
    - Add temporary policy to allow anonymous inserts for holiday gallery photos
    - This is needed to import data from old database
    - Will be removed after migration completes

  2. Security
    - Temporary policy only
    - Should be removed after data import
*/

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Temporary migration insert policy" ON holiday_gallery_photos;

CREATE POLICY "Temporary migration insert policy"
  ON holiday_gallery_photos
  FOR INSERT
  TO anon
  WITH CHECK (true);