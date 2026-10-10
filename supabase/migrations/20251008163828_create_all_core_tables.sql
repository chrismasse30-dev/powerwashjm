/*
  # Create All Core Application Tables

  ## Overview
  This migration creates all the core tables needed for the application including
  quote submissions and associated tracking tables.

  ## Tables Created

  1. quote_submissions - Customer quote form submissions
  2. access_requests - Employee access requests

  ## Security
  - All tables have RLS enabled
  - Appropriate policies for anon, authenticated, and service_role
*/

-- ==========================================
-- Quote Submissions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS quote_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  services text[] DEFAULT '{}',
  page_source text,
  submit_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- New columns for enhanced tracking
  city text,
  state text,
  zip text,
  property_type text,
  selected_package text,
  lead_event text,
  google_drive_folder_id text,
  google_drive_folder_url text
);

ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can insert submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can insert draft submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can update own submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Anonymous users can update submissions" ON quote_submissions;
DROP POLICY IF EXISTS "Service role has full access" ON quote_submissions;
DROP POLICY IF EXISTS "Allow anon insert" ON quote_submissions;
DROP POLICY IF EXISTS "Allow anon update" ON quote_submissions;
DROP POLICY IF EXISTS "Allow authenticated select" ON quote_submissions;
DROP POLICY IF EXISTS "Allow service role all" ON quote_submissions;

-- Create clean policies
CREATE POLICY "quote_submissions_anon_insert"
  ON quote_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "quote_submissions_anon_update"
  ON quote_submissions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quote_submissions_authenticated_select"
  ON quote_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "quote_submissions_authenticated_update"
  ON quote_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quote_submissions_service_role_all"
  ON quote_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quote_submissions_created_at ON quote_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_email ON quote_submissions(submit_email);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_zip ON quote_submissions(zip);

-- ==========================================
-- Access Requests Table
-- ==========================================

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  requested_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by text,
  notes text
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit access request" ON access_requests;
DROP POLICY IF EXISTS "Authenticated users can view access requests" ON access_requests;
DROP POLICY IF EXISTS "Authenticated users can update access requests" ON access_requests;

-- Create clean policies
CREATE POLICY "access_requests_anon_insert"
  ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "access_requests_authenticated_select"
  ON access_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "access_requests_authenticated_update"
  ON access_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_requested_at ON access_requests(requested_at DESC);
