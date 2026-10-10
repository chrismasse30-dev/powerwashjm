/*
  # Add MailJet Event Types to Email Tracking

  ## Overview
  Extends the email_tracking_events table to support MailJet webhook events in addition to ZeptoMail events.

  ## Changes
  
  ### Event Types Added
  - `queued` - Email accepted and queued for delivery
  - `blocked` - Email blocked by MailJet
  - `spam` - Email marked as spam by recipient
  - `unsub` - Recipient unsubscribed
  - `opened` - Email opened (MailJet uses 'opened' vs ZeptoMail's 'open')
  - `clicked` - Email link clicked (MailJet uses 'clicked' vs ZeptoMail's 'click')
  - `bounce` - Generic bounce event
  - `sent` - Already exists, email sent successfully
  - `delivered` - Already exists, email delivered successfully
  
  ### Additional Fields
  - `email_provider` (text) - Tracks which service sent the email: 'zeptomail', 'mailjet', 'brevo'
  - `message_id` (text) - Provider-specific message ID
  - `custom_id` (text) - Custom tracking ID from provider
  
  ### Indexes
  - Index on email_provider for filtering by service
  - Index on message_id for quick provider lookups

  ## Security
  - No RLS changes needed, existing policies cover new event types
  - Webhook can still insert events
  - Authenticated users can view all events

  ## Notes
  - Maintains backward compatibility with ZeptoMail events
  - Both providers can use the same table
  - Event types normalized to lowercase for consistency
*/

-- Add email_provider column to track which service sent the email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_tracking_events' AND column_name = 'email_provider'
  ) THEN
    ALTER TABLE email_tracking_events 
    ADD COLUMN email_provider text DEFAULT 'zeptomail' CHECK (email_provider IN ('zeptomail', 'mailjet', 'brevo'));
  END IF;
END $$;

-- Add message_id column for provider-specific message tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_tracking_events' AND column_name = 'message_id'
  ) THEN
    ALTER TABLE email_tracking_events 
    ADD COLUMN message_id text;
  END IF;
END $$;

-- Add custom_id column for custom tracking IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_tracking_events' AND column_name = 'custom_id'
  ) THEN
    ALTER TABLE email_tracking_events 
    ADD COLUMN custom_id text;
  END IF;
END $$;

-- Update event_type constraint to include all MailJet event types
ALTER TABLE email_tracking_events 
DROP CONSTRAINT IF EXISTS email_tracking_events_event_type_check;

ALTER TABLE email_tracking_events 
ADD CONSTRAINT email_tracking_events_event_type_check 
CHECK (event_type IN (
  'open', 'opened',           -- Email opened (both providers)
  'click', 'clicked',         -- Link clicked (both providers)
  'soft_bounce',              -- ZeptoMail soft bounce
  'hard_bounce',              -- ZeptoMail hard bounce
  'bounce',                   -- MailJet generic bounce
  'delivered',                -- Successfully delivered
  'failed',                   -- Delivery failed
  'sent',                     -- Email sent
  'queued',                   -- MailJet queued
  'blocked',                  -- MailJet blocked
  'spam',                     -- Marked as spam
  'unsub'                     -- Unsubscribed
));

-- Create index on email_provider for filtering
CREATE INDEX IF NOT EXISTS idx_email_events_provider 
ON email_tracking_events(email_provider);

-- Create index on message_id for provider lookups
CREATE INDEX IF NOT EXISTS idx_email_events_message_id 
ON email_tracking_events(message_id);

-- Create index on custom_id for custom tracking
CREATE INDEX IF NOT EXISTS idx_email_events_custom_id 
ON email_tracking_events(custom_id);

-- Add comments for new columns
COMMENT ON COLUMN email_tracking_events.email_provider IS 'Email service provider: zeptomail, mailjet, or brevo';
COMMENT ON COLUMN email_tracking_events.message_id IS 'Provider-specific message ID for tracking';
COMMENT ON COLUMN email_tracking_events.custom_id IS 'Custom tracking ID from email provider';
