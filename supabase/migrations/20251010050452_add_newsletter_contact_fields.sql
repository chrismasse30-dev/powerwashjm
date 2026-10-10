/*
  # Add Contact Information Fields to Newsletter Signups

  ## Purpose
  Enhance newsletter signup system to optionally collect visitor contact information
  (first name, last name, phone number) for better customer relationship management
  and MailChimp integration.

  ## Changes
  
  ### 1. New Columns Added to newsletter_signups table:
    - `first_name` (text, nullable) - Subscriber's first name
    - `last_name` (text, nullable) - Subscriber's last name
    - `phone` (text, nullable) - Subscriber's phone number (validated format)
    - `mailchimp_subscriber_id` (text, nullable) - MailChimp member ID for sync
    - `mailchimp_synced_at` (timestamptz, nullable) - Last successful sync timestamp
    - `mailchimp_tags` (text[], nullable) - Array of applied MailChimp tags

  ### 2. Indexes for Performance:
    - Index on phone for quick lookups
    - Index on mailchimp_subscriber_id for sync operations
    - Composite index on (email, mailchimp_synced_at) for efficient sync queries

  ### 3. Backward Compatibility:
    - All new fields are nullable
    - Existing records remain valid
    - Email-only signups continue to work

  ### 4. Data Integrity:
    - Phone numbers stored in E.164 format (e.g., +14015950726)
    - MailChimp tags stored as PostgreSQL array for efficient querying
    - Timestamps for audit trail

  ## Security
  - No changes to RLS policies (existing policies remain)
  - All fields optional to prevent data collection barriers
  - GDPR compliant (explicit consent via newsletter signup)

  ## Rollback Procedure
  If needed, run:
  ```sql
  ALTER TABLE newsletter_signups 
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS mailchimp_subscriber_id,
    DROP COLUMN IF EXISTS mailchimp_synced_at,
    DROP COLUMN IF EXISTS mailchimp_tags;
  ```
*/

-- Add new columns to newsletter_signups table
ALTER TABLE newsletter_signups 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS mailchimp_subscriber_id text,
  ADD COLUMN IF NOT EXISTS mailchimp_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS mailchimp_tags text[];

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_phone 
  ON newsletter_signups(phone) 
  WHERE phone IS NOT NULL;

-- Create index for MailChimp sync operations
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_mailchimp_id 
  ON newsletter_signups(mailchimp_subscriber_id) 
  WHERE mailchimp_subscriber_id IS NOT NULL;

-- Create composite index for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_email_sync 
  ON newsletter_signups(email, mailchimp_synced_at);

-- Add comment to document the schema
COMMENT ON COLUMN newsletter_signups.first_name IS 'Optional: Subscriber first name for personalization';
COMMENT ON COLUMN newsletter_signups.last_name IS 'Optional: Subscriber last name for personalization';
COMMENT ON COLUMN newsletter_signups.phone IS 'Optional: Phone number in E.164 format (e.g., +14015950726)';
COMMENT ON COLUMN newsletter_signups.mailchimp_subscriber_id IS 'MailChimp member MD5 hash for bidirectional sync';
COMMENT ON COLUMN newsletter_signups.mailchimp_synced_at IS 'Timestamp of last successful MailChimp sync';
COMMENT ON COLUMN newsletter_signups.mailchimp_tags IS 'Array of MailChimp tags applied to this subscriber';
