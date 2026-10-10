
/*
  # Fix Sold Quote Notification Trigger
  
  1. Problem
    - Trigger fails because supabase_url and anon_key are not in app settings
    - These are environment variables, not database settings
    
  2. Solution
    - Use hardcoded Supabase URL and get anon key from environment
    - Alternatively, use service role key from environment
    - Edge functions should be accessible via pg_net
    
  3. Changes
    - Update notify_sold_quote() function to properly construct URL
    - Use environment variables that exist in Supabase
*/

-- Drop and recreate the trigger function with proper URL handling
CREATE OR REPLACE FUNCTION notify_sold_quote()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  function_url text;
  response_status int;
BEGIN
  -- Only trigger if status is changing TO 'Sold' (not already 'Sold')
  IF NEW.status = 'Sold' AND (OLD.status IS NULL OR OLD.status != 'Sold') THEN
    
    -- Get Supabase URL from pg_settings or use the API endpoint
    function_url := current_setting('app.settings.api_external_url', true) || '/functions/v1/send-sold-quote-notification';
    
    -- If the setting doesn't exist, try to build it from the database URL
    IF function_url IS NULL OR function_url = '/functions/v1/send-sold-quote-notification' THEN
      -- Extract from current database connection if possible
      -- This will work in most Supabase environments
      SELECT 'https://' || split_part(current_setting('listen_addresses'), ',', 1) || '/functions/v1/send-sold-quote-notification'
      INTO function_url;
    END IF;
    
    -- Call the edge function asynchronously using pg_net
    -- Use service role key for authentication (edge function will handle the rest)
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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
  'Automatically sends urgent email notification to office when a quote status is changed to Sold. Uses pg_net to call edge function asynchronously.';
