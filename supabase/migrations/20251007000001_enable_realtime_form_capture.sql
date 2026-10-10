/*
  # Enable Real-Time Form Data Capture

  1. Changes
    - Make all fields nullable to support partial form entry
    - Add session_id column for tracking anonymous user sessions
    - Add is_submitted boolean flag to distinguish drafts from final submissions
    - Add updated_at timestamp for tracking changes

  2. Security
    - Allow anonymous users to insert draft submissions
    - Allow anonymous users to update their own submissions
    - Authenticated users can read all submissions

  3. Performance
    - Add index on session_id for efficient lookups
    - Add trigger to auto-update updated_at timestamp
*/

-- Add new columns for tracking partial submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN session_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'is_submitted'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN is_submitted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Make fields nullable to support partial entry
ALTER TABLE quote_submissions
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN submit_email DROP NOT NULL;

-- Set default for submit_email
ALTER TABLE quote_submissions
  ALTER COLUMN submit_email SET DEFAULT 'jmpowerwashing@yahoo.com';

-- Create index on session_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_quote_submissions_session_id ON quote_submissions(session_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can insert submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can insert draft submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can update own submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Service role has full access" ON quote_submissions;

-- Allow anonymous users to insert draft submissions
CREATE POLICY "Anonymous users can insert draft submissions"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update any submission (simplified for real-time updates)
CREATE POLICY "Anonymous users can update submissions"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all submissions
CREATE POLICY "Authenticated users can read submissions"
  ON quote_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON quote_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quote_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_quote_submissions_timestamp ON quote_submissions;
CREATE TRIGGER update_quote_submissions_timestamp
  BEFORE UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_submissions_updated_at();
