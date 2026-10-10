/*
  # Fix Quote Submissions Update Policy - Correct Column Name

  ## Problem
  The previous policy used wrong column name (deleted vs deleted_at)

  ## Solution
  Update the policy to use the correct column name from users table

  ## Changes
  - Drop previous policy
  - Create new policy with correct column names
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Admin users can update quotes" ON quote_submissions;

-- Create new policy that checks users table for admin role by ID or email
CREATE POLICY "Admin users can update quotes"
  ON quote_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = auth.uid() OR users.email = auth.jwt()->>'email')
        AND users.role = 'admin'
        AND users.is_active = true
        AND users.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = auth.uid() OR users.email = auth.jwt()->>'email')
        AND users.role = 'admin'
        AND users.is_active = true
        AND users.deleted_at IS NULL
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Admin users can update quotes" ON quote_submissions 
IS 'Allows admin users (verified in users table by ID or email) to update quote submissions including soft deletes';
