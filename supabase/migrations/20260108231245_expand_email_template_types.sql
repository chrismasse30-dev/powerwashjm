/*
  # Expand Email Template Types

  1. Changes
    - Expand template_type CHECK constraint to include all current and new types:
      - 'residential' - Residential estimate emails
      - 'commercial' - Commercial estimate emails
      - 'form_confirmation' - Form confirmation emails (already exists)
      - 'estimate_followup' - Estimate follow-up emails (already exists)
      - 'instant_quote_confirmation' - Thank you email for instant quote submissions (NEW)

  2. Security
    - No RLS changes needed
    - Maintains existing security policies

  3. Notes
    - Includes all existing template types to prevent constraint violations
    - Adds new instant_quote_confirmation type
*/

-- Drop the old constraint
ALTER TABLE email_templates
DROP CONSTRAINT IF EXISTS email_templates_template_type_check;

-- Add new constraint with all template types
ALTER TABLE email_templates
ADD CONSTRAINT email_templates_template_type_check
CHECK (template_type IN (
  'residential',
  'commercial',
  'form_confirmation',
  'estimate_followup',
  'instant_quote_confirmation'
));

-- Add comment for documentation
COMMENT ON COLUMN email_templates.template_type IS 'Type of template: residential, commercial, form_confirmation, estimate_followup, or instant_quote_confirmation';
