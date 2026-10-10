/*
  # Add 'Sold' Status to Quote Submissions

  1. Changes
    - Update status constraint to include 'Sold' as a valid status
    - This allows importing quotes with 'Sold' status from old database

  2. Notes
    - 'Sold' represents successfully converted quotes
    - Maintains data integrity while allowing migration
*/

-- Drop the existing constraint
ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check;

-- Recreate constraint with 'Sold' included
ALTER TABLE quote_submissions ADD CONSTRAINT quote_submissions_status_check 
  CHECK (status = ANY (ARRAY['Submitted'::text, 'Needs Measure'::text, 'Measured'::text, 'Quoted'::text, 'Completed'::text, 'Lost'::text, 'Sold'::text]));