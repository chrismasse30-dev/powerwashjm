/*
  # Fix Security Issues - Part 3: Remove Unused Indexes
  
  1. Purpose
    - Remove indexes that are not being used by any queries
    - Reduces database maintenance overhead
    - Frees up storage space
    - Improves INSERT/UPDATE/DELETE performance
    
  2. Indexes Removed
    - 35 unused indexes across various tables
    
  3. Performance Impact
    - Reduces write operation overhead
    - Decreases storage requirements
    - Simplifies query planner decisions
*/

-- Remove unused indexes from quote_submissions
DROP INDEX IF EXISTS idx_quote_submissions_requires_measurement;
DROP INDEX IF EXISTS idx_abandoned_email_sent;
DROP INDEX IF EXISTS idx_form_started_for_abandonment;
DROP INDEX IF EXISTS idx_quote_submissions_email;
DROP INDEX IF EXISTS idx_quote_submissions_zip;
DROP INDEX IF EXISTS idx_quote_submissions_deleted;
DROP INDEX IF EXISTS idx_quote_submissions_submitted_deleted;
DROP INDEX IF EXISTS idx_quote_submissions_design_file;
DROP INDEX IF EXISTS idx_quote_submissions_design_data;

-- Remove unused indexes from blog_posts
DROP INDEX IF EXISTS idx_blog_posts_author;

-- Remove unused indexes from blog_publish_queue
DROP INDEX IF EXISTS idx_blog_queue_scheduled;

-- Remove unused indexes from blog_categories
DROP INDEX IF EXISTS idx_blog_categories_slug;

-- Remove unused indexes from blog_tags
DROP INDEX IF EXISTS idx_blog_tags_slug;

-- Remove unused indexes from holiday_gallery_photos
DROP INDEX IF EXISTS idx_holiday_gallery_featured;
DROP INDEX IF EXISTS idx_holiday_gallery_drive_id;

-- Remove unused indexes from site_settings
DROP INDEX IF EXISTS idx_site_settings_key;

-- Remove unused indexes from site_settings_audit_log
DROP INDEX IF EXISTS idx_audit_log_setting_key;

-- Remove unused indexes from newsletter_signups
DROP INDEX IF EXISTS idx_newsletter_signups_phone;
DROP INDEX IF EXISTS idx_newsletter_signups_mailchimp_id;
DROP INDEX IF EXISTS idx_newsletter_signups_email_sync;

-- Remove unused indexes from password_reset_audit
DROP INDEX IF EXISTS idx_password_reset_audit_user_email;
DROP INDEX IF EXISTS idx_password_reset_audit_admin_email;
DROP INDEX IF EXISTS idx_password_reset_audit_created_at;
DROP INDEX IF EXISTS idx_password_reset_audit_status;

-- Remove unused indexes from chat_messages
DROP INDEX IF EXISTS idx_chat_messages_created_at;

-- Remove unused indexes from internal_link_suggestions
DROP INDEX IF EXISTS idx_link_suggestions_status;

-- Remove unused indexes from blog_seo_analytics
DROP INDEX IF EXISTS idx_seo_analytics_score;
DROP INDEX IF EXISTS idx_seo_analytics_date;

-- Remove unused indexes from blog_post_views
DROP INDEX IF EXISTS idx_blog_views_slug_date;

-- Remove unused indexes from competitive_analysis
DROP INDEX IF EXISTS idx_competitive_analysis_keyword;

-- Remove unused indexes from blog_post_versions
DROP INDEX IF EXISTS idx_blog_post_versions_version_number;
DROP INDEX IF EXISTS idx_blog_post_versions_archived_at;

-- Remove unused indexes from ai_content_generations
DROP INDEX IF EXISTS idx_ai_generations_user;
DROP INDEX IF EXISTS idx_ai_generations_type;

-- Remove unused indexes from seo_analysis_cache
DROP INDEX IF EXISTS idx_seo_cache_hash;
DROP INDEX IF EXISTS idx_seo_cache_expires;
