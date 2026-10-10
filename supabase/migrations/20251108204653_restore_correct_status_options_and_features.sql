/*
  # Restore Correct Status Options and Missing Features
  
  1. Changes
    - Add comprehensive status options for quote_submissions matching old project
    - Add missing blog post statuses
    - Ensure all status workflows match old project
    
  2. Status Options
    Quote Submissions: Submitted, Needs Measure, Measured, Quoted, Completed, Lost
    Blog Posts: draft, scheduled, published
*/

-- Update quote_submissions status to allow all workflow states
-- First, let's allow NULL temporarily to update existing records
ALTER TABLE quote_submissions 
ALTER COLUMN status DROP NOT NULL;

-- Update all existing 'Submitted' status to remain as is (this is correct)
-- No changes needed for existing data

-- Add a proper check constraint for status (removing any old constraints first)
DO $$
BEGIN
  -- Drop old constraints if they exist
  ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check;
  ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check1;
  ALTER TABLE quote_submissions DROP CONSTRAINT IF EXISTS quote_submissions_status_check2;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add the correct status constraint matching the old project
ALTER TABLE quote_submissions
ADD CONSTRAINT quote_submissions_status_check 
CHECK (status IN (
  'Submitted',      -- Initial submission state
  'Needs Measure',  -- Requires measurement
  'Measured',       -- Has been measured
  'Quoted',         -- Quote has been sent
  'Completed',      -- Job completed
  'Lost'            -- Customer declined/lost
));

-- Set default to 'Submitted' for new submissions
ALTER TABLE quote_submissions 
ALTER COLUMN status SET DEFAULT 'Submitted';

-- Update any NULL statuses to 'Submitted'
UPDATE quote_submissions 
SET status = 'Submitted' 
WHERE status IS NULL;

-- Ensure blog_posts status has draft option
DO $$
BEGIN
  -- Check if there's a constraint on blog_posts status
  ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add proper blog status constraint
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_status_check 
CHECK (status IN ('draft', 'scheduled', 'published'));

-- Add deleted column to blog_posts if it doesn't exist (for soft deletes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'deleted'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN deleted boolean DEFAULT false;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_submissions_status 
  ON quote_submissions(status) WHERE deleted = false OR deleted IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status 
  ON blog_posts(status) WHERE deleted = false OR deleted IS NULL;
