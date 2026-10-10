/*
  # Add MailChimp Tags Tracking

  1. Changes to newsletter_signups table
    - Add `mailchimp_tags` (text[]) - Array of tags applied to this subscriber
    - Add `tags_applied_at` (timestamptz) - When tags were last applied
    - Add `source` column if not exists (for tracking where signup came from)

  2. Purpose
    - Track which MailChimp tags have been applied to each subscriber
    - Enable audit trail for marketing automation
    - Allow filtering subscribers by applied tags

  3. Notes
    - Tags are stored as text array for flexibility
    - Multiple tags can be applied to a single subscriber
    - Supports tracking tag application history
*/

-- Add mailchimp_tags column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_signups'
    AND column_name = 'mailchimp_tags'
  ) THEN
    ALTER TABLE newsletter_signups
    ADD COLUMN mailchimp_tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Add tags_applied_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_signups'
    AND column_name = 'tags_applied_at'
  ) THEN
    ALTER TABLE newsletter_signups
    ADD COLUMN tags_applied_at timestamptz;
  END IF;
END $$;

-- Create index for faster tag queries
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_mailchimp_tags
ON newsletter_signups USING GIN (mailchimp_tags);

-- Create index for source queries
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_source
ON newsletter_signups (source);

-- Add comment for documentation
COMMENT ON COLUMN newsletter_signups.mailchimp_tags IS
'Array of MailChimp tags applied to this subscriber (e.g., ["Signed Up For Our Specials", "Holiday Subscriber"])';

COMMENT ON COLUMN newsletter_signups.tags_applied_at IS
'Timestamp when MailChimp tags were last updated for this subscriber';
