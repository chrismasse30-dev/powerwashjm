/*
  # Fix Security Issues - Part 5: Enable RLS on Tables with Policies
  
  1. Purpose
    - Enable Row Level Security on tables that have policies but RLS disabled
    - Critical security fix - policies are ineffective without RLS enabled
    
  2. Tables Fixed
    - customer_reviews
    - newsletter_signups
    - quote_submissions
    - users
    
  3. Security Impact
    - Activates all existing RLS policies
    - Prevents unauthorized data access
    - Ensures policies are enforced
*/

-- Enable RLS on customer_reviews
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on newsletter_signups
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quote_submissions
ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
