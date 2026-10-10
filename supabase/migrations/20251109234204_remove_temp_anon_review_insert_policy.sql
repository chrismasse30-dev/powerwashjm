/*
  # Remove Temporary RLS Policy After Migration

  1. Purpose
    - Remove the temporary anonymous insert policy that was created for data migration
    - Restore proper security by ensuring only authenticated users can insert reviews

  2. Security
    - This restores the intended security model
    - Reviews can now only be created by authenticated admin users through the UI
*/

-- Drop the temporary migration policy
DROP POLICY IF EXISTS "TEMP: Allow anon insert for migration" ON customer_reviews;
