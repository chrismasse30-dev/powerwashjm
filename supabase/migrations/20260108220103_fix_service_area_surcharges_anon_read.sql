/*
  # Allow Anonymous Read Access to Service Area Surcharges

  1. Changes
    - Add RLS policy to allow anonymous users to read active surcharge rules
    - This is needed for the instant estimate form to calculate surcharges
  
  2. Security
    - Anonymous users can only SELECT active surcharge rules (not insert, update, or delete)
    - Only authenticated admins can modify surcharge rules
*/

-- Drop policy if it exists, then create it
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view active surcharges" ON service_area_surcharges;
END $$;

-- Allow anonymous users to read active surcharge rules
CREATE POLICY "Public can view active surcharges"
  ON service_area_surcharges
  FOR SELECT
  TO anon
  USING (active = true);
