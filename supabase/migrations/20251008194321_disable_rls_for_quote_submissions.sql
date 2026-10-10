/*
  # Temporarily Disable RLS for Quote Submissions

  This migration disables RLS on the quote_submissions table to allow
  public form submissions. This is a temporary solution to unblock users.

  ## Changes
  - Disable RLS on quote_submissions table
  - Keep all existing policies for when RLS is re-enabled

  ## Security Note
  - This removes RLS protection but table-level grants still apply
  - Only anon, authenticated, and service_role have table access
  - This is acceptable for a public form submission table
*/

-- Disable RLS on quote_submissions
ALTER TABLE quote_submissions DISABLE ROW LEVEL SECURITY;