/*
  # Create Function to Find Abandoned Forms

  1. Purpose
    - Provides a database function to find quote submissions that need abandoned emails
    - Can be called from edge function or external cron service
    - Returns list of quote IDs that meet abandonment criteria

  2. Criteria
    - Status = 'draft'
    - Created more than 30 minutes ago
    - Email has not been sent yet (abandoned_email_sent = false)
    - Not deleted
    - Has email address (required to send email)

  3. Security
    - SECURITY DEFINER to allow service role access
    - Immutable search path to prevent privilege escalation
*/

CREATE OR REPLACE FUNCTION get_abandoned_form_quotes()
RETURNS TABLE (
  quote_id uuid,
  email text,
  name text,
  created_at timestamptz,
  minutes_since_creation integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as quote_id,
    quote_submissions.email,
    quote_submissions.name,
    quote_submissions.created_at,
    EXTRACT(EPOCH FROM (NOW() - quote_submissions.created_at))::integer / 60 as minutes_since_creation
  FROM quote_submissions
  WHERE 
    status = 'draft'
    AND quote_submissions.email IS NOT NULL
    AND quote_submissions.email != ''
    AND abandoned_email_sent = false
    AND deleted = false
    AND is_submitted = false
    AND created_at < NOW() - INTERVAL '30 minutes'
  ORDER BY created_at ASC
  LIMIT 100;
END;
$$;

-- Grant execute permission to authenticated and service role
GRANT EXECUTE ON FUNCTION get_abandoned_form_quotes() TO authenticated, service_role, anon;