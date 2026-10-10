/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys to improve query performance
    - These indexes speed up JOIN operations and foreign key constraint checks

  2. Tables Affected
    - ai_content_generations
    - chat_messages
    - content_variations
    - popup_analytics
    - quote_submissions
    - quote_surcharge_audit
*/

-- ai_content_generations indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_generations_blog_post_id 
  ON ai_content_generations(blog_post_id);

CREATE INDEX IF NOT EXISTS idx_ai_content_generations_user_id 
  ON ai_content_generations(user_id);

-- chat_messages index
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
  ON chat_messages(conversation_id);

-- content_variations index
CREATE INDEX IF NOT EXISTS idx_content_variations_blog_post_id 
  ON content_variations(blog_post_id);

-- popup_analytics index
CREATE INDEX IF NOT EXISTS idx_popup_analytics_popup_config_id 
  ON popup_analytics(popup_config_id);

-- quote_submissions index
CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_saved_by 
  ON quote_submissions(design_saved_by);

-- quote_surcharge_audit index
CREATE INDEX IF NOT EXISTS idx_quote_surcharge_audit_surcharge_rule_id 
  ON quote_surcharge_audit(surcharge_rule_id);