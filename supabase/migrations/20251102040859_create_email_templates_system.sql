/*
  # Create Email Templates Management System

  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `template_name` (text, unique) - Identifier for the template
      - `template_type` (text) - 'residential' or 'commercial'
      - `html_content` (text) - Full HTML template with placeholders
      - `subject_template` (text) - Email subject line with placeholders
      - `description` (text) - Human-readable description
      - `is_active` (boolean) - Whether this template is currently in use
      - `version` (integer) - Version number for tracking changes
      - `created_at` (timestamptz) - When template was created
      - `updated_at` (timestamptz) - Last modification time
      - `created_by` (uuid) - User who created the template
      - `updated_by` (uuid) - User who last updated the template

  2. Security
    - Enable RLS on `email_templates` table
    - Add policy for authenticated users to read templates
    - Add policy for authenticated users to update templates
    - Add policy for authenticated users to insert templates

  3. Features
    - Template versioning for audit trail
    - Active/inactive status for A/B testing
    - User tracking for accountability
    - Automatic timestamp updates
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('residential', 'commercial')),
  html_content text NOT NULL,
  subject_template text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type_active ON email_templates(template_type, is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS email_templates_updated_at_trigger ON email_templates;
CREATE TRIGGER email_templates_updated_at_trigger
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Create template version history table for audit trail
CREATE TABLE IF NOT EXISTS email_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES email_templates(id) ON DELETE CASCADE,
  version integer NOT NULL,
  html_content text NOT NULL,
  subject_template text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  change_notes text
);

-- Enable RLS on version history
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read template versions"
  ON email_template_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert template versions"
  ON email_template_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for version history lookups
CREATE INDEX IF NOT EXISTS idx_email_template_versions_template_id ON email_template_versions(template_id, version DESC);

-- Add comment for documentation
COMMENT ON TABLE email_templates IS 'Stores HTML email templates for QuickMeasure customer estimates';
COMMENT ON TABLE email_template_versions IS 'Audit trail for email template changes';
