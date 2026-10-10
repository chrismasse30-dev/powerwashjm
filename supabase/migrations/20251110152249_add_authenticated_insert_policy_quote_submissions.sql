/*
  # Add Authenticated User INSERT Policy for Quote Submissions

  1. Changes
    - Add INSERT policy for authenticated users on quote_submissions table
    - Allows employees/admins to manually create prospects through the dashboard

  2. Security
    - Restricts to authenticated users only
    - Maintains existing anon policy for public form submissions
*/

-- Drop policy if it exists and recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_submissions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policy for authenticated users to insert quotes
CREATE POLICY "Authenticated users can insert quotes"
  ON quote_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add helpful comment
COMMENT ON POLICY "Authenticated users can insert quotes" ON quote_submissions 
IS 'Allows logged-in employees to manually create prospect records';
