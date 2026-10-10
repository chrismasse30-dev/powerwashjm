/*
  # Create Email Tracking Events System

  ## Overview
  This migration creates a comprehensive email tracking system to capture all ZeptoMail webhook events
  including opens, clicks, bounces, and delivery status for customer estimates.

  ## New Tables
  
  ### `email_tracking_events`
  Stores all email events from ZeptoMail webhooks
  - `id` (uuid, primary key)
  - `quote_id` (uuid, foreign key to quote_submissions)
  - `email_address` (text) - Recipient email
  - `event_type` (text) - Type of event: open, click, soft_bounce, hard_bounce, delivered, failed
  - `event_data` (jsonb) - Full webhook payload for debugging
  - `email_reference` (text) - ZeptoMail email reference ID
  - `client_reference` (text) - Our internal reference (quote_id)
  - `user_agent` (text) - Browser/email client info
  - `ip_address` (text) - Recipient IP address
  - `click_url` (text) - URL clicked (for click events)
  - `bounce_type` (text) - Bounce classification
  - `bounce_reason` (text) - Detailed bounce reason
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on email_tracking_events
  - Allow authenticated users (admins) to read all events
  - Allow anonymous webhook to insert events
  - Prevent unauthorized modifications

  ## Indexes
  - Index on quote_id for fast lookups by customer
  - Index on email_address for searching by email
  - Index on event_type for filtering by event
  - Index on created_at for time-based queries
  - Index on email_reference for ZeptoMail correlation
*/

-- Create email tracking events table
CREATE TABLE IF NOT EXISTS email_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quote_submissions(id) ON DELETE SET NULL,
  email_address text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('open', 'click', 'soft_bounce', 'hard_bounce', 'delivered', 'failed', 'sent')),
  event_data jsonb DEFAULT '{}'::jsonb,
  email_reference text,
  client_reference text,
  user_agent text,
  ip_address text,
  click_url text,
  bounce_type text,
  bounce_reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_tracking_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all events
CREATE POLICY "Authenticated users can view all email events"
  ON email_tracking_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow webhook (anon) to insert events
CREATE POLICY "Webhook can insert email events"
  ON email_tracking_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Prevent unauthorized modifications
CREATE POLICY "Only authenticated users can update email events"
  ON email_tracking_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete email events"
  ON email_tracking_events
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_events_quote_id ON email_tracking_events(quote_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_address ON email_tracking_events(email_address);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_tracking_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_reference ON email_tracking_events(email_reference);

-- Add helpful comments
COMMENT ON TABLE email_tracking_events IS 'Tracks all email events from ZeptoMail webhooks including opens, clicks, and bounces';
COMMENT ON COLUMN email_tracking_events.event_type IS 'Type of email event: open, click, soft_bounce, hard_bounce, delivered, failed, sent';
COMMENT ON COLUMN email_tracking_events.email_reference IS 'ZeptoMail unique email reference ID for correlation';
COMMENT ON COLUMN email_tracking_events.client_reference IS 'Our internal reference (typically quote_id)';
