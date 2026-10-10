/*
  # Email Retry Cron Job

  ## Overview
  Sets up automatic retry for failed confirmation emails every 10 minutes.

  ## Changes
  - Creates pg_cron job to retry failed confirmation emails
  - Runs every 10 minutes to catch and retry any failed emails quickly
  
  ## Schedule
  - Runs: Every 10 minutes
  - Purpose: Automatically retry sending confirmation emails that failed on first attempt
*/

-- Ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Remove existing job if it exists
SELECT cron.unschedule('retry-failed-confirmation-emails')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'retry-failed-confirmation-emails'
);

-- Create cron job to retry failed confirmation emails every 10 minutes
SELECT cron.schedule(
  'retry-failed-confirmation-emails',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/retry-confirmation-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Log successful setup
DO $$
BEGIN
  RAISE NOTICE 'Email retry cron job created: runs every 10 minutes';
END $$;
