/*
  # Remove Unused SMS Functionality

  1. Cleanup Actions
    - Remove brevo_sms_api_key from site_settings (not in use)
    - Drop sms_logs table (empty, no data)
    - Log cleanup action in security audit

  2. Rationale
    - SMS feature is not being used (0 records in sms_logs)
    - No frontend code references SMS functionality
    - Simplifies security surface by removing unused API keys
    - Edge functions send-brevo-sms and send-chat-sms can be removed separately

  3. Impact
    - No user-facing features affected (SMS not in use)
    - Reduces unused database objects
    - Simplifies key management
*/

-- Remove unused SMS API key from site_settings
DELETE FROM site_settings
WHERE setting_key = 'brevo_sms_api_key';

-- Drop sms_logs table (confirmed empty)
DROP TABLE IF EXISTS sms_logs CASCADE;

-- Log the cleanup action
INSERT INTO security_audit_log (
  event_type,
  event_description,
  affected_resource,
  severity,
  created_by
) VALUES (
  'feature_removal',
  'Removed unused SMS functionality including brevo_sms_api_key setting and sms_logs table. SMS feature was never used (0 sends recorded).',
  'brevo_sms_api_key, sms_logs',
  'info',
  'system_cleanup_migration'
);

COMMENT ON TABLE security_audit_log IS 'Audit log for security-related events and incidents. SMS functionality removed 2025-11-10.';
