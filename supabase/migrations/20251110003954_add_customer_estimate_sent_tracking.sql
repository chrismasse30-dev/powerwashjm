/*
  # Add Customer Estimate Email Tracking

  1. Changes
    - Add `customer_estimate_sent` boolean column to track if estimate email was sent to customer
    - Add `customer_estimate_sent_at` timestamp to record when estimate email was sent
    - Set defaults to false/null for existing records
    - Create index for quick lookups of pending estimates

  2. Purpose
    - Provides clear tracking of customer estimate email delivery
    - Separate from `estimate_followup_sent` which may be used for follow-up emails
    - Enables quick queries to find quotes needing estimates sent
*/

-- Add customer estimate email tracking columns
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS customer_estimate_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_estimate_sent_at timestamptz;

-- Create index for finding pending estimates
CREATE INDEX IF NOT EXISTS idx_quote_submissions_customer_estimate_pending
ON quote_submissions(customer_estimate_sent, status)
WHERE deleted = false AND customer_estimate_sent = false;

-- Add helpful comment
COMMENT ON COLUMN quote_submissions.customer_estimate_sent IS 'Tracks if the initial estimate email was sent to the customer';
COMMENT ON COLUMN quote_submissions.customer_estimate_sent_at IS 'Timestamp when the estimate email was sent to customer';
