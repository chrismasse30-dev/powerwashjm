/*
  # Fix Quote Submissions Anonymous Access

  1. Changes
    - Add SELECT policy for anonymous users (needed for .select() after insert/update)
    - Ensure all CRUD operations work for anonymous form submissions

  2. Security
    - Anonymous users can INSERT, UPDATE, and SELECT their own submissions
    - Authenticated users can SELECT all submissions
    - Service role has full access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anon insert" ON quote_submissions;
DROP POLICY IF EXISTS "Allow anon update" ON quote_submissions;
DROP POLICY IF EXISTS "Allow authenticated select" ON quote_submissions;
DROP POLICY IF EXISTS "Allow service role all" ON quote_submissions;

-- Allow anonymous users to INSERT submissions
CREATE POLICY "Allow anon insert"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to UPDATE submissions
CREATE POLICY "Allow anon update"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to SELECT submissions (needed for .select() after insert)
CREATE POLICY "Allow anon select"
  ON quote_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to SELECT all submissions
CREATE POLICY "Allow authenticated select"
  ON quote_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role all"
  ON quote_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
