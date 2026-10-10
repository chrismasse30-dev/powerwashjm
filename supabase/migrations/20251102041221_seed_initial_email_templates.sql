/*
  # Seed Initial Email Templates

  1. Inserts
    - Commercial email template (placeholder)
    - Residential email template (placeholder)
    
  Note: Full templates will be loaded by the application on first use or through the Email Templates UI
*/

-- Insert commercial template placeholder
INSERT INTO email_templates (
  template_name,
  template_type,
  html_content,
  subject_template,
  description,
  is_active,
  version
)
VALUES (
  'commercial_v1',
  'commercial',
  '<!DOCTYPE html><html><body><p>Commercial Template Placeholder</p></body></html>',
  'Your Holiday Lighting Estimate: {{BUSINESS_NAME}}',
  'Professional email template for commercial/business holiday lighting estimates',
  true,
  1
)
ON CONFLICT (template_name) DO NOTHING;

-- Insert residential template placeholder
INSERT INTO email_templates (
  template_name,
  template_type,
  html_content,
  subject_template,
  description,
  is_active,
  version
)
VALUES (
  'residential_v1',
  'residential',
  '<!DOCTYPE html><html><body><p>Residential Template Placeholder</p></body></html>',
  'Your Custom Holiday Lighting Design & Estimate for {{LAST_NAME}} Home',
  'Professional email template for residential/homeowner holiday lighting estimates',
  true,
  1
)
ON CONFLICT (template_name) DO NOTHING;
