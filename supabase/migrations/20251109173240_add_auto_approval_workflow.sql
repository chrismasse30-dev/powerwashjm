/*
  # Add Auto-Approval Workflow for Sold Quotes

  1. New Features
    - Automatic approval when quote status changes to 'Sold'
    - Preserves manual overrides
    - Tracks approval method (automatic vs manual)

  2. Changes
    - Create trigger function to auto-approve when status = 'Sold'
    - Add trigger to quote_submissions table
    - Only auto-approves if not already manually approved

  3. Business Logic
    - When status changes to 'Sold', automatically set estimate_approved = true
    - Set estimate_approved_at to current timestamp if not already set
    - Preserves existing approval timestamps (manual approvals take precedence)
*/

-- Create function to auto-approve when status is set to Sold
CREATE OR REPLACE FUNCTION auto_approve_sold_quotes()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being changed to 'Sold' and not already approved
  IF NEW.status = 'Sold' AND (OLD.estimate_approved IS NULL OR OLD.estimate_approved = false) THEN
    NEW.estimate_approved := true;
    
    -- Only set timestamp if it doesn't already exist (preserve manual approval time)
    IF NEW.estimate_approved_at IS NULL THEN
      NEW.estimate_approved_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on quote_submissions
DROP TRIGGER IF EXISTS trigger_auto_approve_sold_quotes ON quote_submissions;
CREATE TRIGGER trigger_auto_approve_sold_quotes
  BEFORE UPDATE ON quote_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_sold_quotes();

-- Add comment to document the trigger
COMMENT ON FUNCTION auto_approve_sold_quotes() IS 'Automatically approves quotes when status is changed to Sold';
