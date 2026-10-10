/*
  # Create Estimate Approvals Tracking System

  1. New Tables
    - `estimate_approvals`
      - `id` (uuid, primary key)
      - `quote_submission_id` (uuid, foreign key to quote_submissions)
      - `approved_at` (timestamptz)
      - `customer_name` (text)
      - `customer_email` (text)
      - `total_amount` (numeric)
      - `ip_address` (text) - Track who approved
      - `user_agent` (text) - Track device/browser
      - `notification_sent` (boolean) - Track if team was notified
      - `notification_sent_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `estimate_approvals` table
    - Add policy for authenticated users to read all approvals
    - Add policy for anonymous users to insert their own approval
*/

CREATE TABLE IF NOT EXISTS estimate_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_submission_id uuid NOT NULL REFERENCES quote_submissions(id) ON DELETE CASCADE,
  approved_at timestamptz DEFAULT now(),
  customer_name text,
  customer_email text,
  total_amount numeric(10, 2),
  ip_address text,
  user_agent text,
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE estimate_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all approvals"
  ON estimate_approvals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert approval"
  ON estimate_approvals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_estimate_approvals_quote_id 
  ON estimate_approvals(quote_submission_id);

CREATE INDEX IF NOT EXISTS idx_estimate_approvals_approved_at 
  ON estimate_approvals(approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_estimate_approvals_notification_sent 
  ON estimate_approvals(notification_sent) 
  WHERE notification_sent = false;
