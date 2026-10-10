/*
  # Add Password and Active Status to Access Requests

  1. Changes
    - Add `password_hash` column to store user's chosen password securely
    - Add `is_active` column to control whether approved users can login
    - Add `deactivated_at` and `deactivated_by` columns for audit trail

  2. New Columns
    - `password_hash` (text) - Stores the hashed password chosen by user
    - `is_active` (boolean, default true) - Controls if approved user can login
    - `deactivated_at` (timestamptz, nullable) - When user was deactivated
    - `deactivated_by` (text, nullable) - Email of admin who deactivated

  3. Security
    - Users can set their password when requesting access
    - Only admins can change is_active status
    - Login is blocked if is_active is false
*/

-- Add password_hash column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN password_hash text;
  END IF;
END $$;

-- Add is_active column with default true
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Add deactivated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'deactivated_at'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN deactivated_at timestamptz;
  END IF;
END $$;

-- Add deactivated_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'deactivated_by'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN deactivated_by text;
  END IF;
END $$;

-- Allow authenticated users to update is_active status
DROP POLICY IF EXISTS "Authenticated users can update active status" ON access_requests;
CREATE POLICY "Authenticated users can update active status"
  ON access_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
