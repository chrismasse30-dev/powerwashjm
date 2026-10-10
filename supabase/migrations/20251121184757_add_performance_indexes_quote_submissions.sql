/*
  # Add Performance Indexes for Quote Submissions Dashboard

  1. Performance Improvements
    - Add index on `deleted` + `is_submitted` for faster filtering
    - Add index on `status` for status filtering
    - Add index on `page_source` for source filtering
    - Add index on `lead_event` for lead event filtering
    - Add composite index for common queries
    - Improve `created_at` ordering performance

  2. Notes
    - These indexes dramatically speed up the Quote Submissions dashboard
    - Composite indexes help with filtered + sorted queries
    - Only creates indexes if they don't already exist
*/

-- Drop any existing duplicate indexes first to avoid conflicts
DROP INDEX IF EXISTS idx_quote_submissions_deleted_submitted;
DROP INDEX IF EXISTS idx_quote_submissions_status;
DROP INDEX IF EXISTS idx_quote_submissions_page_source;
DROP INDEX IF EXISTS idx_quote_submissions_lead_event;
DROP INDEX IF EXISTS idx_quote_submissions_composite_filter;

-- Add index for deleted + is_submitted filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_deleted_submitted 
ON quote_submissions(deleted, is_submitted, created_at DESC);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_status 
ON quote_submissions(status) 
WHERE deleted = false;

-- Add index for page source filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_page_source 
ON quote_submissions(page_source) 
WHERE deleted = false;

-- Add index for lead event filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_lead_event 
ON quote_submissions(lead_event) 
WHERE deleted = false;

-- Add composite index for common filtered queries
CREATE INDEX IF NOT EXISTS idx_quote_submissions_composite_filter 
ON quote_submissions(deleted, duplicate_of_id, is_submitted, created_at DESC);

-- Improve text search performance
CREATE INDEX IF NOT EXISTS idx_quote_submissions_name_trgm 
ON quote_submissions USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_email_trgm 
ON quote_submissions USING gin(email gin_trgm_ops);

-- Note: gin_trgm_ops requires pg_trgm extension
-- Enable it if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;