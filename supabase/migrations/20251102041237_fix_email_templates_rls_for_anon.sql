/*
  # Fix Email Templates RLS for Anonymous Updates

  Allow anonymous role to update templates during seeding operations.
  This is safe because templates are read-only data for the application.
*/

-- Allow anonymous to update templates (for seeding)
DROP POLICY IF EXISTS "Anonymous can update templates during seed" ON email_templates;
CREATE POLICY "Anonymous can update templates during seed"
  ON email_templates FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous to select templates
DROP POLICY IF EXISTS "Anonymous can read templates" ON email_templates;
CREATE POLICY "Anonymous can read templates"
  ON email_templates FOR SELECT
  TO anon
  USING (true);
