/*
  # Fix Security Issues - Part 1: Indexes

  1. Add Missing Index
    - Add foreign key index on estimate_approvals.quote_submission_id
  
  2. Remove Unused Indexes
    - Drop all unused indexes to reduce maintenance overhead
*/

-- Add missing foreign key index
CREATE INDEX IF NOT EXISTS idx_estimate_approvals_quote_submission_id 
ON estimate_approvals(quote_submission_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_popup_analytics_popup_config_id;
DROP INDEX IF EXISTS idx_quote_submissions_phone;
DROP INDEX IF EXISTS idx_quote_submissions_email_exact;
DROP INDEX IF EXISTS idx_quote_submissions_services;
DROP INDEX IF EXISTS idx_quote_submissions_status_created;
DROP INDEX IF EXISTS idx_quote_submissions_submitted_created;
DROP INDEX IF EXISTS idx_quote_submissions_design_saved_by;
DROP INDEX IF EXISTS idx_quote_submissions_sms_sent;
DROP INDEX IF EXISTS idx_quote_submissions_name_trgm;
DROP INDEX IF EXISTS idx_quote_submissions_email_trgm;
DROP INDEX IF EXISTS idx_quote_submissions_business_name_trgm;
DROP INDEX IF EXISTS idx_quote_submissions_address_trgm;
DROP INDEX IF EXISTS idx_quote_submissions_city_trgm;
DROP INDEX IF EXISTS idx_quote_submissions_deleted;
DROP INDEX IF EXISTS idx_quote_submissions_lead_event;
DROP INDEX IF EXISTS idx_quote_submissions_page_source;
DROP INDEX IF EXISTS idx_quote_submissions_requires_measurement;
DROP INDEX IF EXISTS idx_quote_submissions_abandoned_email;
DROP INDEX IF EXISTS idx_quote_submissions_property_type;
DROP INDEX IF EXISTS idx_quote_submissions_package;
DROP INDEX IF EXISTS idx_security_audit_log_created_at;
DROP INDEX IF EXISTS idx_security_audit_log_severity;
DROP INDEX IF EXISTS idx_email_events_provider;
DROP INDEX IF EXISTS idx_email_events_message_id;
DROP INDEX IF EXISTS idx_email_events_custom_id;
DROP INDEX IF EXISTS idx_ai_generations_blog_post;
DROP INDEX IF EXISTS idx_ai_generations_user;
DROP INDEX IF EXISTS idx_ai_generations_type;
DROP INDEX IF EXISTS idx_content_variations_post;
DROP INDEX IF EXISTS idx_seo_cache_hash;
DROP INDEX IF EXISTS idx_seo_cache_expires;
