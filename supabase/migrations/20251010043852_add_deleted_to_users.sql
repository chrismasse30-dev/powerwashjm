/*
  # Add deleted status to users table

  1. Changes
    - Add `deleted` boolean column to `users` table
    - Default value is false
    - Allow filtering users by deleted status for soft delete functionality
  
  2. Purpose
    - Enable soft delete functionality for user management
    - Allow moving users to a "Deleted" tab without permanently removing them
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'deleted'
  ) THEN
    ALTER TABLE users ADD COLUMN deleted boolean DEFAULT false;
  END IF;
END $$;