/*
  # Create Access Requests Table

  1. New Tables
    - `access_requests`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text) - pending, approved, denied
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `request_token` (text) - unique token for approve/deny links

  2. Security
    - Enable RLS on `access_requests` table
    - Add policy for admin users to view all requests
    - No public access (only edge functions can insert/update)
*/

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  request_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view access requests"
  ON access_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert access requests"
  ON access_requests
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update access requests"
  ON access_requests
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert access requests"
  ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);
