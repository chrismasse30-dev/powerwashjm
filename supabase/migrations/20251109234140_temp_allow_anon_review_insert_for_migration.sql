/*
  # Temporary RLS Policy for Review Migration

  1. Purpose
    - Allow anonymous inserts to customer_reviews table temporarily for data migration
    - This policy will be removed immediately after the migration is complete

  2. Security Note
    - This is a TEMPORARY policy for one-time data migration only
    - Must be removed after migration completes
*/

-- Add temporary INSERT policy for anonymous users (migration only)
CREATE POLICY "TEMP: Allow anon insert for migration"
  ON customer_reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add comment to remind us to remove this policy
COMMENT ON POLICY "TEMP: Allow anon insert for migration" ON customer_reviews IS 'TEMPORARY POLICY - Remove immediately after data migration completes';
