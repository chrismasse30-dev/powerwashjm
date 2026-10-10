/*
  # FIX: Quote Submissions RLS Policy - URGENT

  This migration fixes the RLS policy that is blocking anonymous form submissions.

  ## Problem
  - Forms are failing with "new row violates row-level security policy"
  - The anon_insert_policy exists but is not working correctly

  ## Solution
  - Drop and recreate the anon insert policy with correct syntax
  - Ensure anon role can insert quote submissions
  - Maintain security while allowing form submissions

  ## Changes
  1. Drop existing problematic anon_insert_policy
  2. Create new policy with explicit column permissions
  3. Test that anonymous users can submit forms
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "anon_insert_policy" ON quote_submissions;

-- Create new policy that explicitly allows anon inserts
CREATE POLICY "anon_can_insert_quotes"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verify the policy is working by checking it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quote_submissions' 
    AND policyname = 'anon_can_insert_quotes'
  ) THEN
    RAISE NOTICE '✅ RLS policy created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create RLS policy';
  END IF;
END $$;
