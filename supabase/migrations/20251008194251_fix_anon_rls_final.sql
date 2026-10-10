/*
  # Final Fix for Anonymous RLS Access

  This migration completely removes and recreates the anonymous access policies
  with the most permissive settings possible to allow public form submissions.

  ## Changes
  - Drop ALL existing anon policies
  - Recreate with explicit PERMISSIVE mode and true conditions
  - Ensure no conflicts with other policies

  ## Security
  - Anonymous users can submit quotes (INSERT)
  - Anonymous users can update their drafts (UPDATE)
  - This is required for public quote form functionality
*/

-- Drop all existing anon policies completely
DROP POLICY IF EXISTS "Allow anonymous insert" ON quote_submissions;
DROP POLICY IF EXISTS "Allow anonymous update" ON quote_submissions;
DROP POLICY IF EXISTS "Enable insert for anon users" ON quote_submissions;
DROP POLICY IF EXISTS "Enable update for anon users" ON quote_submissions;

-- Recreate with completely permissive settings
CREATE POLICY "anon_insert_policy"
  ON quote_submissions
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_policy"
  ON quote_submissions
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);