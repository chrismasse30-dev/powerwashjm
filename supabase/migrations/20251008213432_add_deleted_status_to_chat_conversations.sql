/*
  # Add 'deleted' status to chat_conversations
  
  1. Changes
    - Update the status CHECK constraint to include 'deleted'
    - This allows conversations to be marked as deleted instead of permanently removed
  
  2. Notes
    - Deleted conversations can be restored or permanently deleted later
    - This provides a soft delete functionality for the chat system
*/

-- Drop the existing constraint
ALTER TABLE chat_conversations 
DROP CONSTRAINT IF EXISTS chat_conversations_status_check;

-- Add new constraint with 'deleted' status
ALTER TABLE chat_conversations
ADD CONSTRAINT chat_conversations_status_check 
CHECK (status IN ('open', 'closed', 'archived', 'deleted'));