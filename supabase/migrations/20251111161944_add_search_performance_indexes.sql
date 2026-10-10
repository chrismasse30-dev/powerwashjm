/*
  # Add Search and Filter Performance Indexes
  
  1. Performance Improvements
    - Add GIN indexes for full-text search on name, email, business_name, address
    - Add B-tree indexes for common filter fields
    - Add composite indexes for frequently combined queries
    - Enable faster sorting and filtering operations
  
  2. Search Optimization
    - Create tsvector columns for full-text search
    - Add trigram indexes for fuzzy matching
    - Optimize array search for services field
  
  3. Query Performance
    - Index on email for quick lookups
    - Index on phone for contact searches
    - Index on deleted flag for filtering
    - Composite indexes for status + created_at
*/

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for text search fields (name, email, business_name, address, city)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_name_trgm 
  ON quote_submissions USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_email_trgm 
  ON quote_submissions USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_business_name_trgm 
  ON quote_submissions USING gin (business_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_address_trgm 
  ON quote_submissions USING gin (address gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_city_trgm 
  ON quote_submissions USING gin (city gin_trgm_ops);

-- Add index for phone number searches
CREATE INDEX IF NOT EXISTS idx_quote_submissions_phone 
  ON quote_submissions USING btree (phone) 
  WHERE deleted = false;

-- Add index for email exact lookups
CREATE INDEX IF NOT EXISTS idx_quote_submissions_email_exact 
  ON quote_submissions USING btree (email) 
  WHERE deleted = false;

-- Add index for services array (for filtering by service type)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_services 
  ON quote_submissions USING gin (services);

-- Add composite index for status filtering with date sorting
CREATE INDEX IF NOT EXISTS idx_quote_submissions_status_created 
  ON quote_submissions USING btree (status, created_at DESC) 
  WHERE deleted = false;

-- Add composite index for submitted status filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_submitted_created 
  ON quote_submissions USING btree (is_submitted, created_at DESC) 
  WHERE deleted = false;

-- Add index for deleted records
CREATE INDEX IF NOT EXISTS idx_quote_submissions_deleted 
  ON quote_submissions USING btree (deleted, created_at DESC);

-- Add index for lead event filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_lead_event 
  ON quote_submissions USING btree (lead_event) 
  WHERE deleted = false;

-- Add index for page source filtering
CREATE INDEX IF NOT EXISTS idx_quote_submissions_page_source 
  ON quote_submissions USING btree (page_source) 
  WHERE deleted = false;

-- Add index for requires_measurement workflow
CREATE INDEX IF NOT EXISTS idx_quote_submissions_requires_measurement 
  ON quote_submissions USING btree (requires_measurement, status) 
  WHERE deleted = false;

-- Add composite index for abandoned email tracking
CREATE INDEX IF NOT EXISTS idx_quote_submissions_abandoned_email 
  ON quote_submissions USING btree (abandoned_email_sent, abandoned_email_sent_at DESC) 
  WHERE deleted = false;

-- Add composite index for customer estimate tracking
CREATE INDEX IF NOT EXISTS idx_quote_submissions_customer_estimate 
  ON quote_submissions USING btree (customer_estimate_sent, customer_estimate_sent_at DESC) 
  WHERE deleted = false;

-- Add index for property type (Holiday Lights filtering)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_property_type 
  ON quote_submissions USING btree (property_type) 
  WHERE deleted = false AND property_type IS NOT NULL;

-- Add index for package (Holiday Lights filtering)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_package 
  ON quote_submissions USING btree (package) 
  WHERE deleted = false AND package IS NOT NULL;

-- Create a function for global search across all text fields
CREATE OR REPLACE FUNCTION search_quote_submissions(search_term TEXT)
RETURNS TABLE (
  id uuid,
  name text,
  business_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  relevance real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.name,
    q.business_name,
    q.email,
    q.phone,
    q.address,
    q.city,
    q.state,
    q.zip,
    (
      COALESCE(similarity(LOWER(q.name), LOWER(search_term)), 0) * 3 +
      COALESCE(similarity(LOWER(q.business_name), LOWER(search_term)), 0) * 2.5 +
      COALESCE(similarity(LOWER(q.email), LOWER(search_term)), 0) * 2 +
      COALESCE(similarity(LOWER(q.phone), LOWER(search_term)), 0) * 2 +
      COALESCE(similarity(LOWER(q.address), LOWER(search_term)), 0) * 1.5 +
      COALESCE(similarity(LOWER(q.city), LOWER(search_term)), 0) * 1.5 +
      COALESCE(similarity(LOWER(q.state), LOWER(search_term)), 0) * 1 +
      COALESCE(similarity(LOWER(q.zip), LOWER(search_term)), 0) * 1
    )::real AS relevance
  FROM quote_submissions q
  WHERE 
    q.deleted = false
    AND (
      q.name ILIKE '%' || search_term || '%' OR
      q.business_name ILIKE '%' || search_term || '%' OR
      q.email ILIKE '%' || search_term || '%' OR
      q.phone ILIKE '%' || search_term || '%' OR
      q.address ILIKE '%' || search_term || '%' OR
      q.city ILIKE '%' || search_term || '%' OR
      q.state ILIKE '%' || search_term || '%' OR
      q.zip ILIKE '%' || search_term || '%'
    )
  ORDER BY relevance DESC, q.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_quote_submissions(TEXT) TO authenticated;

COMMENT ON INDEX idx_quote_submissions_name_trgm IS 'Trigram index for fuzzy name search';
COMMENT ON INDEX idx_quote_submissions_email_trgm IS 'Trigram index for fuzzy email search';
COMMENT ON INDEX idx_quote_submissions_services IS 'GIN index for services array filtering';
COMMENT ON FUNCTION search_quote_submissions(TEXT) IS 'Global search function with relevance scoring';
