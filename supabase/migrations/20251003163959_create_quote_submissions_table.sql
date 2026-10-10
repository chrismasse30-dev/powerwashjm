/*
  # Create Quote Submissions Table

  1. New Tables
    - `quote_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `name` (text) - Customer's full name
      - `phone` (text) - Customer's phone number
      - `email` (text) - Customer's email address
      - `address` (text) - Service address
      - `services` (text[]) - Array of selected services
      - `page_source` (text) - Which page the form was submitted from
      - `submit_email` (text) - Email address where notification should be sent
      - `created_at` (timestamptz) - Timestamp of submission
      
  2. Security
    - Enable RLS on `quote_submissions` table
    - Add policy for service role to insert submissions
    - Add policy for authenticated admins to read submissions

  3. Indexes
    - Create index on created_at for efficient date-based queries
    - Create index on submit_email for filtering by recipient
*/

CREATE TABLE IF NOT EXISTS quote_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  services text[] DEFAULT '{}',
  page_source text,
  submit_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert submissions (used by edge function)
CREATE POLICY "Service role can insert submissions"
  ON quote_submissions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read submissions (for future admin panel)
CREATE POLICY "Authenticated users can read submissions"
  ON quote_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_submissions_created_at ON quote_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_email ON quote_submissions(submit_email);