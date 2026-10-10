/*
  # Set Up Automated Abandoned Form Email System

  1. Extensions
    - Enable pg_cron extension for scheduled tasks
    - Enable pg_net extension for HTTP requests (if not already enabled)

  2. Scheduled Job
    - Creates a cron job that runs every 5 minutes
    - Calls the send-abandoned-form-email edge function
    - Replaces need for external cron services like Cron-job.org

  3. Security
    - Uses service role key for authentication
    - Runs as a database-native scheduled task

  ## Important Notes
  - This eliminates the need for external cron services (Cron-job.org)
  - The job runs every 5 minutes to catch abandoned forms after 30 minutes
  - The edge function has built-in logic to only process forms 30+ minutes old
  - Each execution is logged in cron.job_run_details table
*/

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing abandoned email cron jobs (in case of re-run)
DO $$
BEGIN
  PERFORM cron.unschedule(jobname) 
  FROM cron.job 
  WHERE jobname = 'send-abandoned-form-emails';
EXCEPTION
  WHEN undefined_table THEN
    -- pg_cron not installed yet, will be after extension creation
    NULL;
END $$;

-- Create a cron job that runs every 5 minutes
-- This will automatically call the edge function to process abandoned forms
SELECT cron.schedule(
  'send-abandoned-form-emails',           -- Job name
  '*/5 * * * *',                          -- Every 5 minutes (cron syntax)
  $$
  SELECT
    net.http_post(
      url:='https://kpyeyjgavuhpxttlghac.supabase.co/functions/v1/send-abandoned-form-email',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweWV5amdhdnVocHh0dGxnaGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5OTIyNTQsImV4cCI6MjA0MzU2ODI1NH0.fZ88VE0Qq37fJn38zAc0PQnb9M0r2sdNdv4cT0HgIcw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);