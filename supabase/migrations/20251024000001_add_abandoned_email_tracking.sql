/*
  # Add Abandoned Form Email Tracking

  1. New Columns
    - `abandoned_email_sent` (boolean) - Tracks if abandoned cart email has been sent
    - `abandoned_email_sent_at` (timestamptz) - Timestamp when abandoned email was sent
    - `form_started_at` (timestamptz) - When user first started filling the form
    - `last_activity_at` (timestamptz) - Last time user interacted with form

  2. Indexes
    - Index on abandoned_email_sent for efficient querying
    - Composite index on form_started_at and abandoned_email_sent for automation queries

  3. Purpose
    - Enable automated abandoned form email campaigns
    - Track 30-minute window for follow-up emails
    - Prevent duplicate emails to same user
*/

-- Add form tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'abandoned_email_sent'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN abandoned_email_sent boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'abandoned_email_sent_at'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN abandoned_email_sent_at timestamptz DEFAULT null;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'form_started_at'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN form_started_at timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for efficient abandoned cart queries
CREATE INDEX IF NOT EXISTS idx_abandoned_email_sent
ON quote_submissions(abandoned_email_sent)
WHERE deleted = false AND is_submitted = false;

CREATE INDEX IF NOT EXISTS idx_form_started_for_abandonment
ON quote_submissions(form_started_at, abandoned_email_sent, is_submitted)
WHERE deleted = false;

-- Add comment explaining the columns
COMMENT ON COLUMN quote_submissions.abandoned_email_sent IS 'Indicates if an abandoned form email has been sent to this user';
COMMENT ON COLUMN quote_submissions.abandoned_email_sent_at IS 'Timestamp when the abandoned form email was sent';
COMMENT ON COLUMN quote_submissions.form_started_at IS 'Timestamp when the user first started filling the form';
COMMENT ON COLUMN quote_submissions.last_activity_at IS 'Timestamp of the last user interaction with the form';
