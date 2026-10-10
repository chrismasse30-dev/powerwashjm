/*
  # Add Change Request Tracking to Quote Submissions

  1. Changes
    - Add `change_request_message` column to store customer's change request text
    - Add `change_request_submitted_at` column to track when request was made
    
  2. Purpose
    - Allows customers to request changes to their holiday lighting proposal
    - Tracks feedback in the database for sales team follow-up
    - Enables better customer communication and proposal refinement
*/

-- Add change request tracking columns
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS change_request_message text,
ADD COLUMN IF NOT EXISTS change_request_submitted_at timestamptz;

-- Create index for efficient querying of change requests
CREATE INDEX IF NOT EXISTS idx_quote_submissions_change_requests 
ON quote_submissions(change_request_submitted_at) 
WHERE change_request_submitted_at IS NOT NULL;