/*
  # Log SMS Edge Function Cleanup

  1. Security Audit
    - Document removal of unused SMS Edge Functions
    - These functions were deployed but never used in production
    - Database tables (sms_logs) already removed in previous migration
    
  2. Functions Being Removed
    - send-brevo-sms: Brevo SMS sender (Brevo SMS not in use)
    - send-chat-sms: Chat SMS notifications (feature not implemented)
    - send-twilio-sms: Twilio SMS sender (alternative provider, not in use)
    - receive-sms: SMS webhook receiver (no SMS integration active)
    
  3. Impact
    - No production impact (functions unused)
    - No database changes needed (tables already removed)
    - Reduces attack surface by removing unused endpoints
    
  4. Verification
    - ✅ No code references found in src/ directory
    - ✅ No database tables depend on these functions
    - ✅ All SMS functionality removed from application
*/

-- Log the cleanup action in security audit log
INSERT INTO security_audit_log (
  event_type,
  event_description,
  affected_resource,
  severity,
  created_by
) VALUES (
  'edge_function_cleanup',
  'Removed 4 unused SMS Edge Functions: send-brevo-sms, send-chat-sms, send-twilio-sms, receive-sms. Functions were deployed but never used in production. SMS functionality fully removed from application.',
  'edge_functions',
  'info',
  'system_maintenance'
);