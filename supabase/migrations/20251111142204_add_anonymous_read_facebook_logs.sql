/*
  # Allow Anonymous Read Access to Facebook Post Logs

  1. Changes
    - Add policy to allow anonymous users to read facebook_post_logs
    - This enables the Facebook Settings page to display recent posts
  
  2. Security
    - Read-only access for public display
    - No sensitive data exposed in logs table
*/

CREATE POLICY "Anonymous can view facebook post logs"
  ON facebook_post_logs
  FOR SELECT
  TO anon
  USING (true);
