/*
  # Fix Facebook Post Logs INSERT Policy
  
  1. Changes
    - Add INSERT policy for service_role to allow edge function to create log entries
    - Add UPDATE policy for service_role to allow edge function to update log status
  
  2. Security
    - Only service_role can insert/update (edge functions)
    - Authenticated users can only read logs
*/

-- Add INSERT policy for service_role (edge functions)
CREATE POLICY "Service role can insert logs"
  ON facebook_post_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add UPDATE policy for service_role (edge functions)
CREATE POLICY "Service role can update logs"
  ON facebook_post_logs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
