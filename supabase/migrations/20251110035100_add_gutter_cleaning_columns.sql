/*
  # Add Gutter Cleaning Columns to Quote Submissions

  1. New Columns
    - `gutter_linear_feet` (integer) - Linear footage of gutters to be cleaned
    - `gutter_stories` (text) - Number of stories for gutter cleaning (1-4)
    - `gutter_soil_level` (text) - Soil/condition level for gutters (light, moderate, heavy)

  2. Purpose
    - Support the new Gutter Cleaning service in the Instant Online Estimate system
    - Store customer-provided measurements and condition assessment

  3. Notes
    - All columns are nullable as not all quotes will include gutter cleaning
    - Uses text for gutter_stories to match existing pattern for stories fields
*/

-- Add gutter cleaning columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'gutter_linear_feet'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN gutter_linear_feet integer;
    COMMENT ON COLUMN quote_submissions.gutter_linear_feet IS 'Linear footage of gutters to be cleaned';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'gutter_stories'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN gutter_stories text;
    COMMENT ON COLUMN quote_submissions.gutter_stories IS 'Number of stories for gutter cleaning (1-4)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_submissions' AND column_name = 'gutter_soil_level'
  ) THEN
    ALTER TABLE quote_submissions ADD COLUMN gutter_soil_level text;
    COMMENT ON COLUMN quote_submissions.gutter_soil_level IS 'Soil/condition level for gutters (light, moderate, heavy)';
  END IF;
END $$;
