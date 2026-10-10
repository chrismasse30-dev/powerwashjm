/*
  # Remove Temporary Seeding Policy

  This migration removes the temporary policy that allowed anonymous
  users to insert town FAQs. Normal security is now restored.
*/

-- Remove the temporary seeding policy
DROP POLICY IF EXISTS "Temporary: Allow anon to insert town FAQs for seeding" ON town_faqs;
