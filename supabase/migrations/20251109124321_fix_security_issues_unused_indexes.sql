/*
  # Fix Security Issues - Remove Unused Indexes
  
  1. Security Improvements
    - Remove unused index `idx_chat_messages_conversation_id` on `chat_messages` table
    - Remove unused index `idx_popup_analytics_popup_config_id` on `popup_analytics` table
    - Remove unused index `idx_quote_submissions_design_saved_by` on `quote_submissions` table
    - Remove unused index `idx_quote_submissions_draft_created` on `quote_submissions` table
  
  2. Impact
    - Reduces database storage overhead
    - Improves write performance (fewer indexes to update)
    - Eliminates security scan warnings
  
  3. Notes
    - These indexes have not been used and are safe to remove
    - If needed in the future, they can be recreated
*/

-- Remove unused index on chat_messages
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;

-- Remove unused index on popup_analytics
DROP INDEX IF EXISTS idx_popup_analytics_popup_config_id;

-- Remove unused index on quote_submissions (design_saved_by)
DROP INDEX IF EXISTS idx_quote_submissions_design_saved_by;

-- Remove unused index on quote_submissions (draft_created)
DROP INDEX IF EXISTS idx_quote_submissions_draft_created;
