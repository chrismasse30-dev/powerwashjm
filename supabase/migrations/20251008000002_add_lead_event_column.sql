/*
  # Add Lead Event Column to Quote Submissions

  1. Changes
    - Add `lead_event` column to `quote_submissions` table
    - Column stores House Call Pro lead event status
    - Possible values: lead.created, lead.deleted, lead.converted, lead.lost, lead.updated
    - Defaults to 'lead.created' for new submissions

  2. Notes
    - This field will be used for future House Call Pro API integration
    - Event keys match House Call Pro webhook event naming convention
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'lead_event'
  ) THEN
    ALTER TABLE quote_submissions
    ADD COLUMN lead_event text DEFAULT 'lead.created' CHECK (lead_event IN ('lead.created', 'lead.deleted', 'lead.converted', 'lead.lost', 'lead.updated'));
  END IF;
END $$;
