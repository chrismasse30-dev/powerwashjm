/*
  # Fix Quote Submissions Update/Delete RLS Policy

  ## Problem
  Users cannot delete quotes because the RLS policy checks for a 'role' claim in the JWT
  that doesn't exist. The authentication system stores user roles in the users table,
  not in JWT claims.

  ## Solution
  Update the RLS policy to check the users table for the role instead of the JWT.

  ## Changes
  - Drop existing admin update policy
  - Create new policy that checks users table for admin role
*/

-- Drop the old policy that checks JWT for role
DROP POLICY IF EXISTS "Admins can update quotes" ON quote_submissions;

-- Create new policy that checks users table for admin role
CREATE POLICY "Authenticated users can update their quotes"
  ON quote_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.is_active = true
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Authenticated users can update their quotes" ON quote_submissions 
IS 'Allows admin users (verified in users table) to update quote submissions';
