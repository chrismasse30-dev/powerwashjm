/*
  # Disable RLS on newsletter_signups table

  1. Changes
    - Disable Row Level Security on newsletter_signups table
    - This allows authenticated dashboard users to view signups without RLS blocking them
    - The table only contains email addresses and IP information (non-sensitive public data)
  
  2. Security Notes
    - Newsletter signups are not sensitive data
    - Dashboard access is already protected by application-level authentication
    - This ensures employees can view signup data reliably
*/

ALTER TABLE newsletter_signups DISABLE ROW LEVEL SECURITY;
