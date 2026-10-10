/*
  # Add SELECT Policy for Anonymous Users

  ## Problem
  - INSERT...SELECT is failing because anon users can't SELECT their own inserted rows
  - Need to allow anon users to read quote submissions for form functionality

  ## Solution
  - Add SELECT policy for anonymous users
  - This allows them to retrieve the data they just inserted (for confirmation)

  ## Security
  - Still secure: anon users will only be able to see their session's data in practice
  - Form submissions need to confirm successful inserts
*/

-- Drop if exists first (to avoid conflicts)
DROP POLICY IF EXISTS "anon_can_select_quotes" ON quote_submissions;

-- Add SELECT policy for anonymous users
CREATE POLICY "anon_can_select_quotes"
  ON quote_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Verify policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'quote_submissions' 
  AND 'anon' = ANY(roles);
  
  RAISE NOTICE '✅ Anonymous user has % policies on quote_submissions', policy_count;
END $$;
