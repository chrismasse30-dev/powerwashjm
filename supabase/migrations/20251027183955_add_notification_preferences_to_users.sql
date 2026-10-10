/*
  # Add Notification Preferences to Users Table

  1. Changes
    - Add `notification_preferences` JSONB column to `users` table
    - Set default notification preferences (all enabled)
  
  2. Security
    - No RLS changes needed (inherits from users table)
  
  3. Notification Types
    - new_quote_requests: Boolean
    - customer_information: Boolean
    - service_requests: Boolean
    - measurement_designs: Boolean
*/

-- Add notification_preferences column with default values
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "new_quote_requests": true,
  "customer_information": true,
  "service_requests": true,
  "measurement_designs": true
}'::jsonb;

-- Update existing users to have default notification preferences
UPDATE users 
SET notification_preferences = '{
  "new_quote_requests": true,
  "customer_information": true,
  "service_requests": true,
  "measurement_designs": true
}'::jsonb
WHERE notification_preferences IS NULL;