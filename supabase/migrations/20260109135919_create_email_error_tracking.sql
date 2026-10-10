/*
  # Email Error Tracking and Retry System

  ## Overview
  Comprehensive system to track email sending failures and automatically retry failed emails.

  ## New Tables
  - `email_sending_errors` - Logs all email sending failures with full error details

  ## New Functions
  - `retry_failed_confirmation_emails()` - Automatically retries failed confirmation emails

  ## Security
  - RLS enabled with appropriate policies for admin access
  - Service role function for retry mechanism
*/

-- Create email sending error log table
CREATE TABLE IF NOT EXISTS email_sending_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_submission_id uuid REFERENCES quote_submissions(id),
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  error_message text NOT NULL,
  error_details jsonb,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_sending_errors ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read errors
CREATE POLICY "Authenticated users can read email errors"
  ON email_sending_errors FOR SELECT
  TO authenticated
  USING (true);

-- Policy for service role to insert errors
CREATE POLICY "Service role can insert email errors"
  ON email_sending_errors FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for service role to update errors
CREATE POLICY "Service role can update email errors"
  ON email_sending_errors FOR UPDATE
  TO service_role
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_errors_quote_id
  ON email_sending_errors(quote_submission_id)
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_email_errors_unresolved
  ON email_sending_errors(resolved, created_at DESC)
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_email_errors_retry
  ON email_sending_errors(retry_count, last_retry_at)
  WHERE resolved = false AND retry_count < 3;

-- Add error tracking columns to quote_submissions
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS form_confirmation_error text,
ADD COLUMN IF NOT EXISTS form_confirmation_last_attempt timestamptz;

-- Create function to find and retry failed confirmation emails
CREATE OR REPLACE FUNCTION retry_failed_confirmation_emails()
RETURNS TABLE (
  quote_id uuid,
  customer_email text,
  should_retry boolean,
  reason text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qs.id as quote_id,
    qs.email as customer_email,
    true as should_retry,
    CASE
      WHEN qs.form_confirmation_sent = false AND qs.form_confirmation_error IS NULL THEN 'Never attempted'
      WHEN qs.form_confirmation_sent = false AND qs.form_confirmation_error IS NOT NULL THEN 'Failed - needs retry'
      ELSE 'Unknown'
    END as reason
  FROM quote_submissions qs
  WHERE qs.is_submitted = true
    AND qs.deleted = false
    AND qs.form_confirmation_sent = false
    AND (
      -- Never attempted
      qs.form_confirmation_last_attempt IS NULL
      OR
      -- Failed and enough time has passed for retry (5 minutes)
      (qs.form_confirmation_error IS NOT NULL
       AND qs.form_confirmation_last_attempt < NOW() - INTERVAL '5 minutes'
       AND COALESCE((
         SELECT retry_count
         FROM email_sending_errors
         WHERE quote_submission_id = qs.id
           AND email_type = 'form_confirmation'
           AND resolved = false
         ORDER BY created_at DESC
         LIMIT 1
       ), 0) < 3)
    )
    AND qs.created_at > NOW() - INTERVAL '7 days'
  ORDER BY qs.created_at DESC;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION retry_failed_confirmation_emails() TO service_role;

-- Add helpful comments
COMMENT ON TABLE email_sending_errors IS 'Tracks all email sending failures for monitoring and retry';
COMMENT ON COLUMN quote_submissions.form_confirmation_error IS 'Last error message when trying to send confirmation email';
COMMENT ON COLUMN quote_submissions.form_confirmation_last_attempt IS 'Last time we attempted to send confirmation email';
