/*
  # Fix Quote Submissions Status Constraint - Add 'Approved' Status
  
  1. Data Cleanup
    - Fix lowercase 'draft' to 'Draft' for consistency
    
  2. Constraint Update  
    - Drop existing status CHECK constraint
    - Fix all invalid status values
    - Add updated constraint with 'Approved' included
    
  3. Valid Statuses After Fix
    - Draft, Submitted, Needs Measure, Measured, Quoted, Approved, Completed, Lost, Sold
    
  4. Why This Is Needed
    - The approve-estimate edge function sets status = 'Approved' when customers approve estimates
    - Current constraint does not include 'Approved', causing updates to fail
    - This prevents the dashboard from showing approved status automatically
*/

-- Step 1: Drop existing constraint first
ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check;

-- Step 2: Now fix any invalid status values (without constraint blocking us)
UPDATE quote_submissions 
SET status = 'Draft' 
WHERE LOWER(status) = 'draft' AND status != 'Draft';

-- Step 3: Add the updated constraint with 'Approved' included
ALTER TABLE quote_submissions ADD CONSTRAINT quote_submissions_status_check 
  CHECK (status = ANY (ARRAY[
    'Draft'::text,
    'Submitted'::text, 
    'Needs Measure'::text, 
    'Measured'::text, 
    'Quoted'::text, 
    'Approved'::text,
    'Completed'::text, 
    'Lost'::text, 
    'Sold'::text
  ]));