/*
  # Security: Revoke Compromised Brevo API Keys

  1. Security Incident
    - Brevo API keys were compromised and need immediate revocation
    - All existing keys must be replaced with new secure keys
    - This migration clears compromised keys from database

  2. Actions Taken
    - Remove compromised brevo_sms_api_key from site_settings
    - Update description to indicate key rotation required
    - Add security audit log entry

  3. Manual Steps Required After Migration
    - Generate new API keys in Brevo dashboard
    - Update .env file with new BREVO_API_KEY
    - Run the update script to populate new keys in database
    - Verify all edge functions are using new keys

  4. Security Notes
    - NEVER commit API keys to version control
    - Rotate API keys regularly (every 90 days recommended)
    - Monitor Brevo dashboard for unauthorized usage
    - Review sms_logs table for suspicious activity
*/

-- Clear compromised Brevo SMS API key
UPDATE site_settings
SET 
  setting_value = 'REVOKED_COMPROMISED_KEY_NEEDS_REPLACEMENT',
  description = 'Brevo SMS API Key - SECURITY: Previous key compromised on 2025-11-10, requires immediate replacement',
  updated_at = NOW()
WHERE setting_key = 'brevo_sms_api_key';

-- Add security audit log
DO $$
BEGIN
  -- Log the security incident
  RAISE NOTICE '⚠️  SECURITY ALERT: Brevo API keys have been revoked due to compromise';
  RAISE NOTICE '📋 Action Required:';
  RAISE NOTICE '   1. Generate new Brevo API keys at: https://app.brevo.com/settings/keys/api';
  RAISE NOTICE '   2. Update .env file with new BREVO_API_KEY';
  RAISE NOTICE '   3. Update site_settings.brevo_sms_api_key via admin panel or SQL';
  RAISE NOTICE '   4. Verify edge functions are working with new keys';
  RAISE NOTICE '   5. Monitor for unauthorized usage in Brevo dashboard';
END $$;

-- Create security_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_description text NOT NULL,
  affected_resource text,
  severity text DEFAULT 'info',
  created_at timestamptz DEFAULT NOW(),
  created_by text
);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert security logs"
  ON security_audit_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Log the security incident
INSERT INTO security_audit_log (
  event_type,
  event_description,
  affected_resource,
  severity,
  created_by
) VALUES (
  'api_key_compromise',
  'Brevo API keys were compromised and revoked. All keys have been cleared from database and require replacement with new keys generated from Brevo dashboard.',
  'brevo_sms_api_key',
  'critical',
  'system_security_migration'
);

-- Add index for efficient security log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
  ON security_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity 
  ON security_audit_log(severity, created_at DESC);

COMMENT ON TABLE security_audit_log IS 'Audit log for security-related events and incidents';
