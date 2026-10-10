/*
  # Add deleted flag to quote_submissions

  1. Changes
    - Add `deleted` boolean column to track soft-deleted quotes
    - Default value is false (not deleted)
    - Allows quotes to be marked as deleted without permanent removal
    - Deleted quotes can be viewed in a separate tab and restored if needed

  2. Purpose
    - Enable soft delete functionality for quotes
    - Maintain audit trail of deleted quotes
    - Allow restoration of accidentally deleted quotes
*/

-- Add deleted column to quote_submissions
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT false NOT NULL;

-- Create index for better query performance when filtering deleted quotes
CREATE INDEX IF NOT EXISTS idx_quote_submissions_deleted
ON quote_submissions(deleted);

-- Create composite index for common query patterns (status + deleted)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_submitted_deleted
ON quote_submissions(is_submitted, deleted);