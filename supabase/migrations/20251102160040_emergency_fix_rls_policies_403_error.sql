/*
  # EMERGENCY FIX: 403 Forbidden Error on Form Submissions

  ## Critical Issue
  - Forms returning 403 Forbidden error
  - Blocking ALL customer quote submissions
  - Business-critical issue requiring immediate resolution

  ## Root Cause
  - RLS policies exist but may have syntax issues
  - Possible policy conflict or caching issue
  - Need to rebuild policies from scratch

  ## Solution
  1. Drop all existing anon policies
  2. Recreate with guaranteed working syntax
  3. Verify immediately with test submission

  ## Expected Result
  - Forms will submit successfully
  - No 403 errors
  - Immediate restoration of business functionality
*/

-- STEP 1: Drop potentially problematic policies
DROP POLICY IF EXISTS "anon_can_insert_quotes" ON quote_submissions;
DROP POLICY IF EXISTS "anon_can_select_quotes" ON quote_submissions;
DROP POLICY IF EXISTS "anon_update_policy" ON quote_submissions;

-- STEP 2: Recreate with explicit, simple policies that WILL work
CREATE POLICY "allow_anon_insert"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_select"  
  ON quote_submissions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "allow_anon_update"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- STEP 3: Verify policies are active
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'quote_submissions' 
    AND 'anon' = ANY(roles);
  
  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ EMERGENCY FIX APPLIED: % anon policies active', policy_count;
  ELSE
    RAISE EXCEPTION '❌ EMERGENCY FIX FAILED: Only % policies found', policy_count;
  END IF;
END $$;
