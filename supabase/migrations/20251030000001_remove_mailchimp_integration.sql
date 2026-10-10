/*
  # Remove MailChimp Integration

  ## Purpose
  Complete removal of all MailChimp integration components from the database.
  This migration removes columns, indexes, and comments related to MailChimp.

  ## Changes

  ### 1. Remove MailChimp Columns from newsletter_signups:
    - Drop `mailchimp_tags` (text[])
    - Drop `mailchimp_subscriber_id` (text)
    - Drop `mailchimp_synced_at` (timestamptz)
    - Drop `tags_applied_at` (timestamptz)

  ### 2. Remove MailChimp Columns from quote_submissions:
    - Drop `mailchimp_tags` (text[])
    - Drop `tags_applied_at` (timestamptz)

  ### 3. Remove Associated Indexes:
    - Drop GIN index on mailchimp_tags
    - Drop index on mailchimp_subscriber_id
    - Drop composite index on (email, mailchimp_synced_at)

  ## Rollback
  This migration cannot be easily rolled back as it involves data deletion.
  Ensure you have backups before running if you need to preserve MailChimp data.

  ## Impact
  - All MailChimp tag tracking will be removed
  - Sync timestamps will be deleted
  - Newsletter signups will retain email, name, phone, and source data
  - No impact on core newsletter functionality
*/

-- Drop indexes first
DROP INDEX IF EXISTS idx_newsletter_signups_mailchimp_tags;
DROP INDEX IF EXISTS idx_newsletter_signups_mailchimp_id;
DROP INDEX IF EXISTS idx_newsletter_signups_email_sync;

-- Remove MailChimp columns from newsletter_signups
ALTER TABLE newsletter_signups
  DROP COLUMN IF EXISTS mailchimp_tags,
  DROP COLUMN IF EXISTS mailchimp_subscriber_id,
  DROP COLUMN IF EXISTS mailchimp_synced_at,
  DROP COLUMN IF EXISTS tags_applied_at;

-- Remove MailChimp columns from quote_submissions if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions'
    AND column_name = 'mailchimp_tags'
  ) THEN
    ALTER TABLE quote_submissions DROP COLUMN mailchimp_tags;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions'
    AND column_name = 'tags_applied_at'
  ) THEN
    ALTER TABLE quote_submissions DROP COLUMN tags_applied_at;
  END IF;
END $$;

-- Clean up any remaining source indexes that were specifically for mailchimp
DROP INDEX IF EXISTS idx_newsletter_signups_source;

-- Re-create source index for general use (not mailchimp-specific)
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_source
ON newsletter_signups (source)
WHERE source IS NOT NULL;
