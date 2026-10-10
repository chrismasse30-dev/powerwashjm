/*
  # Fix Comprehensive Security Issues (Final)
  
  ## Changes Made:
  
  ### 1. Add Missing Indexes for Foreign Keys
  - Add index on `chat_messages.conversation_id` for foreign key performance
  - Add index on `popup_analytics.popup_config_id` for foreign key performance
  - Add index on `quote_submissions.design_saved_by` for foreign key performance
  
  ### 2. Remove Unused Indexes
  These indexes are not being used by any queries and add unnecessary overhead:
  - Drop `idx_quote_submissions_estimate_approved_at`
  - Drop `idx_quote_submissions_customer_estimate_pending`
  - Drop `idx_estimate_approvals_quote_id`
  - Drop `idx_estimate_approvals_approved_at`
  - Drop `idx_estimate_approvals_notification_sent`
  - Drop `idx_email_events_email_address`
  - Drop `idx_email_events_created_at`
  - Drop `idx_email_events_reference`
  
  ### 3. Fix Function Security (Search Path)
  - Update `get_full_name` function with SECURITY DEFINER and fixed search_path
  - Update `auto_approve_sold_quotes` function with SECURITY DEFINER and fixed search_path
  
  ## Security Impact:
  - Improved query performance for foreign key lookups
  - Reduced index maintenance overhead
  - Eliminated mutable search_path security vulnerabilities
*/

-- ============================================================================
-- PART 1: Add Missing Indexes for Foreign Keys
-- ============================================================================

-- Add index for chat_messages.conversation_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
ON public.chat_messages(conversation_id);

-- Add index for popup_analytics.popup_config_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_popup_analytics_popup_config_id 
ON public.popup_analytics(popup_config_id);

-- Add index for quote_submissions.design_saved_by (if not exists)
CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_saved_by 
ON public.quote_submissions(design_saved_by);

-- ============================================================================
-- PART 2: Remove Unused Indexes
-- ============================================================================

-- Drop unused indexes on quote_submissions
DROP INDEX IF EXISTS public.idx_quote_submissions_estimate_approved_at;
DROP INDEX IF EXISTS public.idx_quote_submissions_customer_estimate_pending;

-- Drop unused indexes on estimate_approvals
DROP INDEX IF EXISTS public.idx_estimate_approvals_quote_id;
DROP INDEX IF EXISTS public.idx_estimate_approvals_approved_at;
DROP INDEX IF EXISTS public.idx_estimate_approvals_notification_sent;

-- Drop unused indexes on email_tracking_events
DROP INDEX IF EXISTS public.idx_email_events_email_address;
DROP INDEX IF EXISTS public.idx_email_events_created_at;
DROP INDEX IF EXISTS public.idx_email_events_reference;

-- ============================================================================
-- PART 3: Fix Function Security (Search Path)
-- ============================================================================

-- Fix get_full_name function with proper search_path
DROP FUNCTION IF EXISTS public.get_full_name() CASCADE;

CREATE FUNCTION public.get_full_name()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_name TEXT;
BEGIN
  SELECT name INTO user_name
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_name, 'Unknown User');
END;
$$;

-- Fix auto_approve_sold_quotes function with proper search_path
-- First, drop the trigger that depends on it
DROP TRIGGER IF EXISTS trigger_auto_approve_sold_quotes ON public.quote_submissions;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.auto_approve_sold_quotes();

-- Recreate function with proper security settings and correct return type (TRIGGER)
CREATE FUNCTION public.auto_approve_sold_quotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If status is being changed to 'Sold' and not already approved
  IF NEW.status = 'Sold' AND (OLD.estimate_approved IS NULL OR OLD.estimate_approved = false) THEN
    NEW.estimate_approved := true;
    
    -- Only set timestamp if it doesn't already exist (preserve manual approval time)
    IF NEW.estimate_approved_at IS NULL THEN
      NEW.estimate_approved_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger with the updated function
CREATE TRIGGER trigger_auto_approve_sold_quotes
  BEFORE UPDATE OF status ON public.quote_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'Sold')
  EXECUTE FUNCTION public.auto_approve_sold_quotes();

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_full_name() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_full_name() TO anon;

-- Note: Trigger functions don't need explicit EXECUTE grants as they're invoked by the system

-- ============================================================================
-- VERIFICATION NOTES
-- ============================================================================

-- Verify the changes with these queries:
-- 
-- 1. Check new indexes exist:
--    SELECT indexname, tablename FROM pg_indexes 
--    WHERE indexname IN ('idx_chat_messages_conversation_id', 'idx_popup_analytics_popup_config_id', 'idx_quote_submissions_design_saved_by');
--
-- 2. Verify old indexes are removed:
--    SELECT indexname FROM pg_indexes 
--    WHERE indexname IN ('idx_quote_submissions_estimate_approved_at', 'idx_email_events_email_address');
--
-- 3. Check function security (should show prosecdef=true and search_path set):
--    SELECT proname, prosecdef, proconfig FROM pg_proc 
--    WHERE proname IN ('get_full_name', 'auto_approve_sold_quotes');