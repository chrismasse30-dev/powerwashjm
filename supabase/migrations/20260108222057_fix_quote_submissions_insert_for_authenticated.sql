/*
  # Fix Quote Submissions Insert for Authenticated Users

  1. Changes
    - Add INSERT policy for authenticated users
    - This allows both anon (public) and authenticated users to submit quotes
  
  2. Security
    - Both anon and authenticated roles can insert quotes
    - Existing RLS policies remain secure
*/

-- Drop policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_submissions;

-- Add INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert quotes"
  ON quote_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
