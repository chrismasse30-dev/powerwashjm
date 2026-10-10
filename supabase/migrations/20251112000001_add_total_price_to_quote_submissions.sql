/*
  # Add Total Price to Quote Submissions

  1. Changes
    - Add `total_price` numeric column to store the estimate amount
    - This allows follow-up emails to display the correct quote amount

  2. Notes
    - Default to 0 for existing records
    - Allow NULL for quotes that haven't been priced yet
*/

-- Add total_price column
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS total_price numeric(10,2);

-- Add comment for documentation
COMMENT ON COLUMN quote_submissions.total_price IS 'Total estimated price for the quote in USD';

-- Create index for filtering quotes by price range
CREATE INDEX IF NOT EXISTS idx_quote_submissions_total_price
ON quote_submissions(total_price)
WHERE deleted = false AND total_price IS NOT NULL;
