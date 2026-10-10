/*
  # Fix Fleet Photos Public Access
  
  1. Changes
    - Add SELECT policy for anonymous users to view active fleet photos
    - This allows the public About Us page to display fleet images
  
  2. Security
    - Only allows SELECT (read-only) access
    - Only for photos marked as is_active = true
    - No write permissions for anonymous users
*/

-- Allow anonymous users to view active fleet photos
CREATE POLICY "Anyone can view active fleet photos"
  ON fleet_photos
  FOR SELECT
  TO anon
  USING (is_active = true);
