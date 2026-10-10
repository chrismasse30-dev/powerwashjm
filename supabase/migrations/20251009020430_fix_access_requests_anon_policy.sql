/*
  # Fix Access Requests Anonymous Insert Policy

  1. Changes
    - Drop existing INSERT policies
    - Recreate INSERT policy for anonymous users with explicit permissions
    - Ensure anon role can insert into access_requests table
    
  2. Security
    - Allow anonymous users to submit access requests
    - Maintain RLS security for SELECT and UPDATE operations
*/

-- Drop existing insert policies
DROP POLICY IF EXISTS "access_requests_anon_insert" ON access_requests;
DROP POLICY IF EXISTS "Anonymous users can insert access requests" ON access_requests;
DROP POLICY IF EXISTS "Service role can insert access requests" ON access_requests;

-- Create a new policy that explicitly allows anon role to insert
CREATE POLICY "Allow anonymous users to submit access requests"
  ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also ensure authenticated users can insert (for logged in submissions)
CREATE POLICY "Allow authenticated users to submit access requests"
  ON access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
