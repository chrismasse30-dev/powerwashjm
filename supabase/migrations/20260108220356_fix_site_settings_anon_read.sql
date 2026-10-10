/*
  # Allow Anonymous Read Access to Site Settings

  1. Changes
    - Add RLS policy to allow anonymous users to read site settings
    - This is needed for the instant estimate form to check notification settings
  
  2. Security
    - Anonymous users can only SELECT (not insert, update, or delete)
    - Only authenticated admins can modify site settings
*/

-- Drop policy if it exists, then create it
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
END $$;

-- Allow anonymous users to read site settings
CREATE POLICY "Public can view site settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);
