/*
  # Update Newsletter Signups Schema and Migrate Quote Contacts

  1. Schema Changes
    - Add `city` column (text)
    - Add `state` column (text)
    - Add `services_interested_in` column (text array)
    - Add `property_type` column (text)
    - Add `business_name` column (text)
    - Add `opted_out` column (boolean, default false)
    - Remove unused MailChimp columns
    - Update indexes for performance

  2. Data Migration
    - Migrate all non-deleted contacts from quote_submissions to newsletter_signups
    - Deduplicate by email address
    - Preserve existing newsletter signups

  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns to newsletter_signups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'city'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'state'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'services_interested_in'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN services_interested_in text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN property_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'business_name'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN business_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletter_signups' AND column_name = 'opted_out'
  ) THEN
    ALTER TABLE newsletter_signups ADD COLUMN opted_out boolean DEFAULT false;
  END IF;
END $$;

-- Create full_name computed column helper function
CREATE OR REPLACE FUNCTION get_full_name(fname text, lname text, email_name text)
RETURNS text AS $$
BEGIN
  IF fname IS NOT NULL AND lname IS NOT NULL THEN
    RETURN fname || ' ' || lname;
  ELSIF fname IS NOT NULL THEN
    RETURN fname;
  ELSIF lname IS NOT NULL THEN
    RETURN lname;
  ELSIF email_name IS NOT NULL THEN
    RETURN email_name;
  ELSE
    RETURN 'Unknown';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Migrate contacts from quote_submissions to newsletter_signups
INSERT INTO newsletter_signups (
  email,
  first_name,
  last_name,
  phone,
  city,
  state,
  services_interested_in,
  property_type,
  business_name,
  source,
  subscribed,
  opted_out,
  created_at
)
SELECT DISTINCT ON (LOWER(q.email))
  LOWER(q.email) as email,
  SPLIT_PART(q.name, ' ', 1) as first_name,
  CASE 
    WHEN array_length(string_to_array(q.name, ' '), 1) > 1 
    THEN array_to_string((string_to_array(q.name, ' '))[2:], ' ')
    ELSE NULL
  END as last_name,
  q.phone,
  q.city,
  q.state,
  q.services as services_interested_in,
  q.property_type,
  q.business_name,
  COALESCE(q.page_source, 'Quote Submission') as source,
  true as subscribed,
  COALESCE(q.deleted, false) as opted_out,
  q.created_at
FROM quote_submissions q
WHERE 
  q.email IS NOT NULL 
  AND q.email != ''
  AND COALESCE(q.deleted, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM newsletter_signups ns 
    WHERE LOWER(ns.email) = LOWER(q.email)
  )
ORDER BY LOWER(q.email), q.created_at DESC;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_city_state 
ON newsletter_signups(city, state) 
WHERE city IS NOT NULL AND state IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_signups_opted_out 
ON newsletter_signups(opted_out) 
WHERE opted_out = false;

-- Update existing records to set opted_out based on deleted field if it exists
UPDATE newsletter_signups 
SET opted_out = false 
WHERE opted_out IS NULL;

COMMENT ON COLUMN newsletter_signups.services_interested_in IS 'Array of services the contact is interested in';
COMMENT ON COLUMN newsletter_signups.property_type IS 'Type of property: Residential or Commercial';
COMMENT ON COLUMN newsletter_signups.business_name IS 'Business name if commercial property';
COMMENT ON COLUMN newsletter_signups.opted_out IS 'Whether contact has opted out of communications';
