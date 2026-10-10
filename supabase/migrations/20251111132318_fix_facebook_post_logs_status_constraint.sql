/*
  # Fix Facebook Post Logs Status Constraint
  
  1. Changes
    - Drop existing status check constraint
    - Add new constraint that allows 'pending', 'success', and 'failed' statuses
  
  2. Reason
    - Edge function needs to create logs with 'pending' status before posting
    - Original constraint only allowed 'success' and 'failed'
*/

-- Drop the old constraint
ALTER TABLE facebook_post_logs 
DROP CONSTRAINT IF EXISTS facebook_post_logs_status_check;

-- Add new constraint with 'pending' included
ALTER TABLE facebook_post_logs
ADD CONSTRAINT facebook_post_logs_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text]));
