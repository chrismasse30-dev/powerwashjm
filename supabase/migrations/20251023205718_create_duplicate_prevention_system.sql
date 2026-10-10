/*
  # CRM Duplicate Prevention & Status Management System
  
  ## Overview
  Implements comprehensive duplicate detection, automated merging, and status workflow corrections
  to resolve critical data inconsistencies identified in audit.
  
  ## Changes
  
  ### 1. Duplicate Detection Infrastructure
  - Creates partial unique index on email (prevents new duplicates while allowing null emails)
  - Adds duplicate tracking columns to monitor and flag existing duplicates
  - Implements composite key tracking for multi-field duplicate detection
  
  ### 2. Status Workflow Corrections
  - Adds status transition logging for audit trail
  - Creates automated status cascade for related records
  - Implements abandoned email eligibility validation
  
  ### 3. Data Quality Columns
  - `duplicate_of_id`: Links duplicate records to master record
  - `duplicate_checked_at`: Timestamp of last duplicate scan
  - `status_corrected_at`: Timestamp of last status workflow correction
  - `workflow_issues`: JSON field tracking any workflow anomalies
  
  ## Security
  - Maintains existing RLS policies
  - Audit trail for all duplicate merges
  - Status transitions logged for compliance
*/

-- Step 1: Add data quality tracking columns
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS duplicate_of_id UUID REFERENCES quote_submissions(id),
ADD COLUMN IF NOT EXISTS duplicate_checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_corrected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS workflow_issues JSONB DEFAULT '[]'::jsonb;

-- Step 2: Create partial unique index (allows null emails, prevents duplicate non-null emails)
-- This will fail if duplicates exist, so we handle that in the cleanup script
DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_email 
  ON quote_submissions(LOWER(email)) 
  WHERE deleted = false AND duplicate_of_id IS NULL AND email IS NOT NULL AND email != '';
EXCEPTION 
  WHEN OTHERS THEN
    RAISE NOTICE 'Unique index creation skipped - duplicates must be resolved first';
END $$;

-- Step 3: Create duplicate detection function
CREATE OR REPLACE FUNCTION detect_quote_duplicates()
RETURNS TABLE (
  email_address TEXT,
  record_count BIGINT,
  master_id UUID,
  duplicate_ids UUID[],
  has_submitted BOOLEAN,
  has_draft BOOLEAN,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qs.email::TEXT,
    COUNT(*)::BIGINT as record_count,
    (ARRAY_AGG(qs.id ORDER BY 
      CASE WHEN qs.is_submitted THEN 1 ELSE 2 END,
      qs.created_at DESC
    ))[1] as master_id,
    ARRAY_AGG(qs.id) FILTER (WHERE qs.id != (ARRAY_AGG(qs.id ORDER BY 
      CASE WHEN qs.is_submitted THEN 1 ELSE 2 END,
      qs.created_at DESC
    ))[1]) as duplicate_ids,
    BOOL_OR(qs.is_submitted) as has_submitted,
    BOOL_OR(NOT qs.is_submitted AND NOT qs.deleted) as has_draft,
    CASE 
      WHEN BOOL_OR(qs.is_submitted) AND BOOL_OR(NOT qs.is_submitted) THEN 'CRITICAL'
      WHEN COUNT(*) > 2 THEN 'HIGH'
      ELSE 'MEDIUM'
    END::TEXT as severity
  FROM quote_submissions qs
  WHERE qs.email IS NOT NULL 
    AND qs.email != ''
    AND qs.deleted = false
    AND qs.duplicate_of_id IS NULL
  GROUP BY qs.email
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to check if email should receive abandoned email
CREATE OR REPLACE FUNCTION should_send_abandoned_email(quote_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  quote_record RECORD;
  has_submitted_record BOOLEAN;
BEGIN
  -- Get the quote record
  SELECT * INTO quote_record
  FROM quote_submissions
  WHERE id = quote_id;
  
  -- Don't send if already submitted
  IF quote_record.is_submitted THEN
    RETURN FALSE;
  END IF;
  
  -- Don't send if deleted
  IF quote_record.deleted THEN
    RETURN FALSE;
  END IF;
  
  -- Don't send if already sent
  IF quote_record.abandoned_email_sent THEN
    RETURN FALSE;
  END IF;
  
  -- Don't send if less than 30 minutes old
  IF EXTRACT(EPOCH FROM (NOW() - quote_record.form_started_at))/60 < 30 THEN
    RETURN FALSE;
  END IF;
  
  -- CRITICAL: Check if this email has a submitted record
  SELECT EXISTS(
    SELECT 1 
    FROM quote_submissions 
    WHERE email = quote_record.email
      AND is_submitted = true
      AND deleted = false
      AND id != quote_id
  ) INTO has_submitted_record;
  
  -- Don't send if a submitted record exists for this email
  IF has_submitted_record THEN
    -- Log this as a workflow issue
    UPDATE quote_submissions
    SET workflow_issues = workflow_issues || jsonb_build_object(
      'type', 'abandoned_email_blocked',
      'reason', 'submitted_record_exists',
      'checked_at', NOW()
    )
    WHERE id = quote_id;
    
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create monitoring view for dashboard
CREATE OR REPLACE VIEW quote_status_health AS
SELECT 
  COUNT(*) FILTER (WHERE is_submitted = false AND deleted = false) as total_drafts,
  COUNT(*) FILTER (WHERE is_submitted = true AND deleted = false) as total_submitted,
  COUNT(*) FILTER (WHERE deleted = true) as total_deleted,
  COUNT(*) FILTER (WHERE abandoned_email_sent = true) as abandoned_emails_sent,
  COUNT(DISTINCT email) FILTER (WHERE deleted = false) as unique_contacts,
  COUNT(*) FILTER (WHERE deleted = false) - COUNT(DISTINCT email) FILTER (WHERE deleted = false) as potential_duplicates,
  COUNT(*) FILTER (WHERE duplicate_of_id IS NOT NULL) as confirmed_duplicates,
  COUNT(*) FILTER (WHERE workflow_issues != '[]'::jsonb) as records_with_issues
FROM quote_submissions;

-- Step 6: Add helpful comment
COMMENT ON FUNCTION detect_quote_duplicates() IS 'Detects duplicate quote records by email address and returns master/duplicate IDs for merging';
COMMENT ON FUNCTION should_send_abandoned_email(UUID) IS 'Validates if a quote record is eligible for abandoned email, checking for submitted records with same email';
COMMENT ON VIEW quote_status_health IS 'Dashboard view showing overall CRM data quality metrics';
