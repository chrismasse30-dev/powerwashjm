/*
  # Fix Anonymous Access to Quote Submissions

  This migration fixes the RLS policies to allow anonymous users (website visitors)
  to submit quote forms without authentication errors.

  ## Changes
  - Drop existing restrictive policies for anonymous users
  - Create new permissive policies that allow anonymous INSERT and UPDATE operations
  - Maintain security for authenticated users and service role

  ## Security
  - Anonymous users can INSERT new quotes (form submissions)
  - Anonymous users can UPDATE quotes (for draft saves)
  - Authenticated users can read, update, and delete all quotes
  - Service role has full access
*/

-- Drop the existing anon policies
DROP POLICY IF EXISTS "Enable insert for anon users" ON quote_submissions;
DROP POLICY IF EXISTS "Enable update for anon users" ON quote_submissions;
DROP POLICY IF EXISTS "allow_anon_insert_quote_submissions" ON quote_submissions;

-- Create new permissive INSERT policy for anonymous users
CREATE POLICY "Allow anonymous insert"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create new permissive UPDATE policy for anonymous users (for draft auto-save)
CREATE POLICY "Allow anonymous update"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);