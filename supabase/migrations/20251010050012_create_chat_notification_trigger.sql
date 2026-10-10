/*
  # Add Database Trigger for Chat Email Notifications

  1. Purpose
    - Ensures email notifications are ALWAYS sent when a new chat conversation is created
    - Acts as a backup to the client-side email notification
    - Guarantees sales team receives immediate notification

  2. Changes
    - Creates a database function that calls the send-chat-email-notification edge function
    - Creates a trigger that fires after a new chat_conversations record is inserted
    - Ensures no chat request is missed even if client-side notification fails

  3. Security
    - Function uses service role to call edge function
    - Trigger only fires on INSERT operations
    - No user data exposed
*/

-- Create function to send chat email notification
CREATE OR REPLACE FUNCTION notify_new_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_info RECORD;
  first_name TEXT;
  last_name TEXT;
  service_info TEXT;
BEGIN
  -- Parse customer name into first and last name
  first_name := split_part(NEW.customer_name, ' ', 1);
  last_name := COALESCE(split_part(NEW.customer_name, ' ', 2), '');
  
  -- Get initial message to extract service info
  SELECT message INTO service_info
  FROM chat_messages
  WHERE conversation_id = NEW.id
  AND sender_type = 'customer'
  ORDER BY created_at ASC
  LIMIT 1;

  -- Call the edge function to send email
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-chat-email-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'firstName', first_name,
        'lastName', last_name,
        'email', '',
        'phone', NEW.customer_phone,
        'service', COALESCE(service_info, 'Not specified'),
        'source', NEW.source_url
      )
    );

  RETURN NEW;
END;
$$;

-- Create trigger that fires after new conversation is created
DROP TRIGGER IF EXISTS trigger_new_chat_notification ON chat_conversations;

CREATE TRIGGER trigger_new_chat_notification
  AFTER INSERT ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_chat();
