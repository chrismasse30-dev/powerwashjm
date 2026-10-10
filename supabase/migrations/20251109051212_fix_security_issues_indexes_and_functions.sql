/*
  # Fix Security Issues - Indexes and Functions

  1. Performance Improvements
    - Add missing indexes for foreign keys:
      - `chat_messages.conversation_id`
      - `popup_analytics.popup_config_id`
      - `quote_submissions.design_saved_by`
    - Remove unused indexes:
      - `idx_newsletter_signups_city_state`
      - `idx_newsletter_signups_opted_out`

  2. Security Fixes
    - Fix `get_full_name` function search path to be immutable
    - Drop and recreate function with proper security settings

  3. Notes
    - Foreign key indexes improve JOIN performance
    - Removing unused indexes reduces storage and write overhead
    - Immutable search paths prevent privilege escalation attacks
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
ON chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_popup_analytics_popup_config_id 
ON popup_analytics(popup_config_id);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_saved_by 
ON quote_submissions(design_saved_by);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_newsletter_signups_city_state;
DROP INDEX IF EXISTS idx_newsletter_signups_opted_out;

-- Fix function search path by dropping and recreating with proper settings
DROP FUNCTION IF EXISTS get_full_name(uuid);

CREATE OR REPLACE FUNCTION get_full_name(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  full_name text;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name)
  INTO full_name
  FROM users
  WHERE id = user_id;
  
  RETURN COALESCE(full_name, 'Unknown User');
END;
$$;