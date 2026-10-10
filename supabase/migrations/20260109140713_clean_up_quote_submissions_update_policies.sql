/*
  # Clean Up Quote Submissions Update Policies

  ## Problem
  Multiple conflicting UPDATE policies exist on quote_submissions table,
  which can cause confusion and potential security issues.

  ## Solution
  Remove all existing UPDATE policies and create clean, specific policies:
  1. Admin users can update any quote (for dashboard operations like delete)
  2. Anonymous users can update their own drafts (for form auto-save)

  ## Changes
  - Drop all existing UPDATE policies
  - Create new clean policies with clear purposes
*/

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Admin users can update quotes" ON quote_submissions;
DROP POLICY IF EXISTS "Authenticated users can update their quotes" ON quote_submissions;
DROP POLICY IF EXISTS "Admins can update quotes" ON quote_submissions;
DROP POLICY IF EXISTS "Public can update quotes" ON quote_submissions;

-- Policy 1: Admin users can update any quote submission
CREATE POLICY "Admins can update any quote"
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

-- Policy 2: Anonymous users can update their draft quotes (for form auto-save)
-- This allows updating drafts before submission, but not submitted quotes
CREATE POLICY "Anonymous can update draft quotes"
  ON quote_submissions FOR UPDATE
  TO anon
  USING (is_submitted = false AND deleted = false)
  WITH CHECK (is_submitted = false AND deleted = false);

-- Add helpful comments
COMMENT ON POLICY "Admins can update any quote" ON quote_submissions 
IS 'Allows admin users to update or soft-delete any quote submission';

COMMENT ON POLICY "Anonymous can update draft quotes" ON quote_submissions 
IS 'Allows anonymous users to update their own draft quotes for form auto-save functionality';
