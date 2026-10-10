/*
  # Fix Google Business Post Logs to Allow Photo Type

  1. Changes
    - Updates the post_type constraint on google_business_post_logs table
    - Adds 'photo' as a valid post_type option
    - This fixes the mismatch between the database constraint and the post-photo-to-gbp function
  
  2. Security
    - No changes to RLS policies
    - Maintains existing security posture
*/

-- Drop the existing constraint
ALTER TABLE google_business_post_logs 
DROP CONSTRAINT IF EXISTS google_business_post_logs_post_type_check;

-- Add the updated constraint with 'photo' included
ALTER TABLE google_business_post_logs 
ADD CONSTRAINT google_business_post_logs_post_type_check 
CHECK (post_type IN ('blog_post', 'update', 'offer', 'event', 'photo'));