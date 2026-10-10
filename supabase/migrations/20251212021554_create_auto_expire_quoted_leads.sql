/*
  # Auto-Expire Quoted Leads After 45 Days

  1. Schema Changes
    - Add `status_changed_at` column to track when status was last modified
    - Backfill existing records with created_at or updated_at values

  2. Functions
    - Create trigger function to update `status_changed_at` when status changes
    - Create function to auto-expire quotes that have been "Quoted" for 45+ days

  3. Automation
    - Set up pg_cron job to run daily and expire old quotes

  4. Security
    - Maintain existing RLS policies
    - Function runs with SECURITY DEFINER to bypass RLS for automation
*/

-- Add status_changed_at column to track when status was last changed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'status_changed_at'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN status_changed_at timestamptz;

    -- Backfill with updated_at or created_at for existing records
    UPDATE quote_submissions
    SET status_changed_at = COALESCE(updated_at, created_at)
    WHERE status_changed_at IS NULL;

    -- Set default for new records
    ALTER TABLE quote_submissions ALTER COLUMN status_changed_at SET DEFAULT now();
  END IF;
END $$;

-- Create trigger function to update status_changed_at when status changes
CREATE OR REPLACE FUNCTION update_status_changed_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update status_changed_at if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_update_status_changed_at ON quote_submissions;

CREATE TRIGGER trigger_update_status_changed_at
  BEFORE UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_status_changed_at();

-- Create function to auto-expire old quoted leads
CREATE OR REPLACE FUNCTION auto_expire_old_quoted_leads()
RETURNS TABLE (
  expired_count integer,
  expired_quote_ids uuid[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_expired_count integer;
  v_expired_ids uuid[];
BEGIN
  -- Find and update quotes that have been in "Quoted" status for 45+ days
  WITH expired_quotes AS (
    UPDATE quote_submissions
    SET
      status = 'Lost',
      updated_at = now()
    WHERE
      status = 'Quoted'
      AND status_changed_at <= now() - interval '45 days'
      AND deleted = false
    RETURNING id
  )
  SELECT
    COUNT(*)::integer,
    ARRAY_AGG(id)
  INTO v_expired_count, v_expired_ids
  FROM expired_quotes;

  -- Log the expiration
  RAISE NOTICE 'Auto-expired % quotes that were in Quoted status for 45+ days', COALESCE(v_expired_count, 0);

  RETURN QUERY SELECT v_expired_count, v_expired_ids;
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run daily at 2 AM
-- First, unschedule any existing job with this name
SELECT cron.unschedule('auto-expire-quoted-leads')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-expire-quoted-leads'
);

-- Schedule the new job
SELECT cron.schedule(
  'auto-expire-quoted-leads',
  '0 2 * * *', -- Run at 2 AM every day
  $$SELECT auto_expire_old_quoted_leads();$$
);

-- Add comment for documentation
COMMENT ON FUNCTION auto_expire_old_quoted_leads IS
'Automatically changes quote status from "Quoted" to "Lost" after 45 days of inactivity. Runs daily at 2 AM via pg_cron.';

COMMENT ON COLUMN quote_submissions.status_changed_at IS
'Timestamp tracking when the status was last changed. Used for auto-expiring old quotes.';