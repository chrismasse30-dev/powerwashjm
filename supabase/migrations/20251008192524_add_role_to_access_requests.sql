/*
  # Add Role Column to Access Requests
  
  1. Changes
    - Add `role` column to `access_requests` table
      - Default value: 'user'
      - Allowed values: 'admin', 'user'
  
  2. Notes
    - This allows admins to set the user role when approving access requests
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'role'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('admin', 'user'));
  END IF;
END $$;
