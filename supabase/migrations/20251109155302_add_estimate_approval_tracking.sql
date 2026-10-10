/*
  # Add Estimate Approval Tracking to Quote Submissions

  1. New Columns
    - `estimate_approved` (boolean) - Indicates if the estimate has been approved by the customer
    - `estimate_approved_at` (timestamptz) - Timestamp when the estimate was approved
    - `estimate_approved_by_ip` (text) - IP address of the customer who approved

  2. Changes
    - Add estimate_approved column with default false
    - Add estimate_approved_at column for tracking approval timestamp
    - Add estimate_approved_by_ip for audit trail
    - Create index on estimate_approved for faster filtering

  3. Notes
    - This allows tracking which estimates have been approved by customers
    - The approved timestamp helps with pipeline management and reporting
    - IP tracking provides additional security and audit trail
*/

-- Add estimate approval tracking columns
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS estimate_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimate_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimate_approved_by_ip TEXT;

-- Create index for filtering by approval status
CREATE INDEX IF NOT EXISTS idx_quote_submissions_estimate_approved 
ON quote_submissions(estimate_approved) 
WHERE deleted = false;

-- Create index for approval date queries
CREATE INDEX IF NOT EXISTS idx_quote_submissions_estimate_approved_at 
ON quote_submissions(estimate_approved_at) 
WHERE estimate_approved = true AND deleted = false;

-- Add comment to document the column
COMMENT ON COLUMN quote_submissions.estimate_approved IS 'Indicates if the customer has approved their estimate via the approval link';
COMMENT ON COLUMN quote_submissions.estimate_approved_at IS 'Timestamp when the customer approved their estimate';
COMMENT ON COLUMN quote_submissions.estimate_approved_by_ip IS 'IP address of the customer who approved the estimate for audit purposes';
