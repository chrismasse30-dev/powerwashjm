/*
  # Fix Estimate Follow-Up Tracking

  1. Problem
    - The `estimate_followup_sent` flag was being incorrectly set to TRUE when sending initial estimates
    - This flag should ONLY be set when the "Send Follow Up" button is manually clicked
    - Need to clean up existing incorrect data

  2. Solution
    - Reset `estimate_followup_sent` and `estimate_followup_sent_at` for all quotes where:
      * Follow-up was marked as sent
      * BUT the timestamp matches the initial estimate timestamp (customer_estimate_sent_at)
      * This indicates it was set incorrectly during initial estimate send
    
  3. Impact
    - Ensures "Estimate Follow Up" column only shows "Sent" when actually sent via the button
    - Preserves legitimate follow-ups where the timestamp differs from initial estimate
*/

-- Reset incorrect estimate_followup tracking where it was set at same time as initial estimate
UPDATE quote_submissions
SET 
  estimate_followup_sent = false,
  estimate_followup_sent_at = NULL
WHERE 
  estimate_followup_sent = true
  AND customer_estimate_sent = true
  AND estimate_followup_sent_at = customer_estimate_sent_at;

-- Add helpful comment
COMMENT ON COLUMN quote_submissions.estimate_followup_sent IS 
'TRUE only when the "Send Follow Up" button is manually clicked - NOT when initial estimate is sent';

COMMENT ON COLUMN quote_submissions.customer_estimate_sent IS 
'TRUE when the initial estimate email is sent to customer from QuickMeasure page';
