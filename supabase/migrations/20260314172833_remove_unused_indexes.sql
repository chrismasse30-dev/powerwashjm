/*
  # Remove Unused Indexes

  1. Performance Improvements
    - Remove unused indexes that consume space and slow down writes
    - These indexes are not being used by queries based on database analysis

  2. Indexes Removed
    - idx_email_sending_errors_quote_submission_id
    - idx_quote_surcharge_audit_quote_submission_id
*/

-- Remove unused index on email_sending_errors
DROP INDEX IF EXISTS idx_email_sending_errors_quote_submission_id;

-- Remove unused index on quote_surcharge_audit
DROP INDEX IF EXISTS idx_quote_surcharge_audit_quote_submission_id;