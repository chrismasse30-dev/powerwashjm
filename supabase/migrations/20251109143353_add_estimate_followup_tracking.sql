/*
  # Add Estimate Follow-Up Email Tracking

  1. Changes
    - Add `estimate_followup_sent` boolean column to track if follow-up email was sent
    - Add `estimate_followup_sent_at` timestamp column to track when follow-up was sent
    
  2. Notes
    - These columns help track which quotes have received follow-up emails
    - Prevents duplicate follow-up emails to the same customer
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_submissions' AND column_name = 'estimate_followup_sent'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN estimate_followup_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_submissions' AND column_name = 'estimate_followup_sent_at'
  ) THEN
    ALTER TABLE quote_submissions 
    ADD COLUMN estimate_followup_sent_at timestamptz;
  END IF;
END $$;
