/*
  # Create Newsletter Signups Table

  1. New Tables
    - `newsletter_signups`
      - `id` (uuid, primary key)
      - `email` (text, unique, required) - Visitor's email address
      - `ip_address` (text) - IP address of the visitor
      - `ip_city` (text) - City from IP geolocation
      - `ip_state` (text) - State from IP geolocation
      - `created_at` (timestamptz) - When they signed up
  
  2. Security
    - Enable RLS on `newsletter_signups` table
    - Add policy for anonymous users to insert their own data
    - Add policy for authenticated users to read all signups
*/

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  ip_address text,
  ip_city text,
  ip_state text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for newsletter"
  ON newsletter_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all signups"
  ON newsletter_signups
  FOR SELECT
  TO authenticated
  USING (true);