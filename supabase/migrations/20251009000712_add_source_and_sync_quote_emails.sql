/*
  # Add source tracking and sync quote submission emails to newsletter signups

  1. Changes
    - Add `source` column to newsletter_signups to track where the signup came from
    - Migrate all emails from quote_submissions (who opted in for specials) to newsletter_signups
    - Preserve IP data when available
    - Handle duplicates gracefully (skip if already exists)
  
  2. Data Migration
    - Insert all unique emails from quote_submissions where submit_email is not null
    - Set source to 'Quote Form' for migrated emails
    - Set source to 'Footer Newsletter' for existing entries (default)
*/

-- Add source column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_signups' AND column_name = 'source'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN source text DEFAULT 'Footer Newsletter';
  END IF;
END $$;

-- Insert emails from quote submissions who opted in for specials
-- Use ON CONFLICT to skip duplicates
INSERT INTO newsletter_signups (email, ip_address, ip_city, ip_state, source, created_at)
SELECT DISTINCT ON (qs.email)
  qs.email,
  NULL as ip_address,  -- IP address not stored in quote_submissions
  qs.ip_city,
  qs.ip_state,
  'Quote Form' as source,
  qs.created_at
FROM quote_submissions qs
WHERE qs.submit_email IS NOT NULL 
  AND qs.submit_email != ''
  AND qs.email IS NOT NULL
  AND qs.email != ''
  AND qs.email NOT IN (SELECT email FROM newsletter_signups)
ORDER BY qs.email, qs.created_at ASC
ON CONFLICT (email) DO NOTHING;

-- Update existing newsletter signups to have a source if they don't already
UPDATE newsletter_signups 
SET source = 'Footer Newsletter'
WHERE source IS NULL;
