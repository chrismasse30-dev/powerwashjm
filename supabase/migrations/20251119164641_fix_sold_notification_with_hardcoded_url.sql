
/*
  # Fix Sold Quote Notification with Hardcoded Values
  
  1. Problem
    - Trigger trying to use current_setting() for values that don't exist
    - Need to hardcode the Supabase URL and anon key
    
  2. Solution
    - Use the actual Supabase project URL
    - Use the actual anon key
    
  3. Security
    - Function remains SECURITY DEFINER
    - Only fires on status change to 'Sold'
*/

-- Drop and recreate with hardcoded values
CREATE OR REPLACE FUNCTION notify_sold_quote()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  function_url text;
BEGIN
  -- Only trigger if status is changing TO 'Sold' (not already 'Sold')
  IF NEW.status = 'Sold' AND (OLD.status IS NULL OR OLD.status != 'Sold') THEN
    
    -- Use the actual Supabase project URL
    function_url := 'https://hlehvmcuwklbgvydrddt.supabase.co/functions/v1/send-sold-quote-notification';
    
    -- Call the edge function asynchronously using pg_net
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZWh2bWN1d2tsYmd2eWRyZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTkxMzEsImV4cCI6MjA3ODE5NTEzMX0.x-wG9sMF1D-gr7TODEQmESkYsZdWoiKOLqmFjItVSVg'
      ),
      body := jsonb_build_object(
        'quoteId', NEW.id
      ),
      timeout_milliseconds := 10000
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION notify_sold_quote() IS 
  'Automatically sends urgent email notification to office when a quote status is changed to Sold. Includes client details and QuickMeasure design information.';
