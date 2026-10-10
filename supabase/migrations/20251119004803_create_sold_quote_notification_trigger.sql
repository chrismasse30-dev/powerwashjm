/*
  # Create Automatic Sold Quote Notification System
  
  1. New Function
    - `notify_sold_quote()` - Triggers when quote status changes to 'Sold'
    - Automatically calls the send-sold-quote-notification edge function
    - Sends urgent email to jmpowerwashing@yahoo.com with all client details
    
  2. New Trigger
    - `trigger_notify_sold_quote` - Fires on UPDATE of quote_submissions
    - Only triggers when status changes to 'Sold'
    - Prevents duplicate notifications
    
  3. Email Contents
    - Marked as URGENT in subject and banner
    - Complete client information
    - QuickMeasure design images (if available)
    - Estimate amount
    - Next steps for team
    
  4. Security
    - Function uses SECURITY DEFINER to call edge function with proper permissions
    - Only triggers on actual status change to 'Sold'
*/

-- Create function to send sold quote notification
CREATE OR REPLACE FUNCTION notify_sold_quote()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  function_url text;
  supabase_url text;
  anon_key text;
  response_status int;
BEGIN
  -- Only trigger if status is changing TO 'Sold' (not already 'Sold')
  IF NEW.status = 'Sold' AND (OLD.status IS NULL OR OLD.status != 'Sold') THEN
    
    -- Get Supabase URL from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- Build edge function URL
    function_url := supabase_url || '/functions/v1/send-sold-quote-notification';
    
    -- Call the edge function asynchronously using pg_net
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'quoteId', NEW.id
      )
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_sold_quote ON quote_submissions;

-- Create trigger on quote_submissions
CREATE TRIGGER trigger_notify_sold_quote
  AFTER UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_sold_quote();

-- Add comment for documentation
COMMENT ON FUNCTION notify_sold_quote() IS 
  'Automatically sends urgent email notification to office when a quote status is changed to Sold. Includes client details and QuickMeasure design information.';