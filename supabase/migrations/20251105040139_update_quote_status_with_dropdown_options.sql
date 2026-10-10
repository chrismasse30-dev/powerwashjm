/*
  # Update Quote Submissions Status Column
  
  1. Changes
    - Add CHECK constraint to status column with 5 predefined options
    - Set default value to 'Needs Measure' for new submissions
    - Update existing NULL or invalid status values to 'Needs Measure'
  
  2. Status Options (in order)
    - Needs Measure
    - Measured
    - Quoted
    - Sold
    - Lost
  
  3. Notes
    - Preserves existing valid status values
    - Updates any NULL or non-conforming values to default
*/

-- First, update any NULL or non-standard status values to 'Needs Measure'
UPDATE quote_submissions
SET status = 'Needs Measure'
WHERE status IS NULL 
   OR status NOT IN ('Needs Measure', 'Measured', 'Quoted', 'Sold', 'Lost');

-- Drop the existing default if it exists
ALTER TABLE quote_submissions 
ALTER COLUMN status DROP DEFAULT;

-- Set the new default value
ALTER TABLE quote_submissions 
ALTER COLUMN status SET DEFAULT 'Needs Measure';

-- Make the column NOT NULL since it now has a default
ALTER TABLE quote_submissions 
ALTER COLUMN status SET NOT NULL;

-- Add a CHECK constraint to enforce the valid status values
ALTER TABLE quote_submissions
DROP CONSTRAINT IF EXISTS quote_submissions_status_check;

ALTER TABLE quote_submissions
ADD CONSTRAINT quote_submissions_status_check 
CHECK (status IN ('Needs Measure', 'Measured', 'Quoted', 'Sold', 'Lost'));
