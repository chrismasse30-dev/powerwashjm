/*
  # Add Form Confirmation Email Tracking

  ## Changes
  - Add `form_confirmation_sent` boolean to track if confirmation email was sent
  - Add `form_confirmation_sent_at` timestamp to track when it was sent
  - Add indexes for dashboard queries
  
  ## Purpose
  This allows the Email Report Dashboard to track both:
  1. QuickMeasure estimate emails (customer_estimate_sent)
  2. Form confirmation emails (form_confirmation_sent)
*/

-- Add tracking columns for form confirmation emails
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS form_confirmation_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS form_confirmation_sent_at timestamptz;

-- Add index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_quote_submissions_form_confirmation 
ON quote_submissions(form_confirmation_sent, form_confirmation_sent_at DESC) 
WHERE form_confirmation_sent = true AND deleted = false;

-- Add helpful comments
COMMENT ON COLUMN quote_submissions.form_confirmation_sent IS 'True if form confirmation email was sent to customer';
COMMENT ON COLUMN quote_submissions.form_confirmation_sent_at IS 'Timestamp when form confirmation email was sent';
