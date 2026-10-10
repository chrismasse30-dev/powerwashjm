/*
  # Rollback Chat Trigger and Add Notification Tracking

  1. Changes
    - Drop the chat notification trigger (doesn't work without net extension)
    - Create a notification_log table to track email notifications
    - Add ability to manually resend notifications from dashboard

  2. Tables
    - notification_log: Tracks all notification attempts
*/

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_new_chat_notification ON chat_conversations;
DROP FUNCTION IF EXISTS notify_new_chat();

-- Create notification log table
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  reference_id uuid NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view notification logs
CREATE POLICY "Authenticated users can view notification logs"
  ON notification_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert notification logs
CREATE POLICY "Anyone can insert notification logs"
  ON notification_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
