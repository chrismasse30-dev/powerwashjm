/*
  # Add DELETE policy for facebook_post_logs

  1. Changes
    - Add DELETE policy for authenticated users on facebook_post_logs table
    - Allows authenticated users to delete Facebook post log entries

  2. Security
    - Only authenticated users can delete records
    - No additional restrictions on deletion
*/

CREATE POLICY "Authenticated users can delete Facebook post logs"
  ON facebook_post_logs
  FOR DELETE
  TO authenticated
  USING (true);
