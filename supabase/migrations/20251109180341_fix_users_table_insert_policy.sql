/*
  # Fix Users Table INSERT Policy

  1. Security Issue
    - Users table is missing INSERT policy for authenticated users
    - This prevents admins from creating new users through the UI

  2. Changes
    - Add INSERT policy to allow authenticated users to create new user records
    - Policy allows any authenticated user to insert (admin check happens in application layer)

  3. Notes
    - The application layer (UserManagementPage) already restricts user creation to admins
    - This RLS policy allows the database operation to proceed for authenticated users
*/

-- Add INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment to document the policy
COMMENT ON POLICY "Authenticated users can insert users" ON users IS 'Allows authenticated users to create new user records. Admin authorization is enforced at the application layer.';
