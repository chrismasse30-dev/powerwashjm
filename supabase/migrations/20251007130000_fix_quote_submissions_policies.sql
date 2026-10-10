/*
  # Fix Quote Submissions RLS Policies

  1. Changes
    - Ensure anon users can insert and update quote_submissions
    - Ensure authenticated users can read all submissions
    - Ensure service role has full access

  2. Security
    - Anonymous users: INSERT and UPDATE (for draft submissions)
    - Authenticated users: SELECT (for dashboard)
    - Service role: Full access
*/

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Service role can insert submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can insert draft submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can update own submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can update submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Service role has full access" ON quote_submissions;

-- Allow anonymous users to insert submissions (for form submission)
CREATE POLICY "Allow anon insert"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update submissions (for draft updates)
CREATE POLICY "Allow anon update"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to SELECT all submissions (for dashboard)
CREATE POLICY "Allow authenticated select"
  ON quote_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Allow service role all"
  ON quote_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
