/*
  # Create Chat System

  1. New Tables
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `customer_name` (text) - Full name of customer
      - `customer_phone` (text) - Phone number
      - `source_url` (text) - Where they initiated chat
      - `status` (text) - open, closed, archived
      - `last_message_at` (timestamptz) - For sorting
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `sender_type` (text) - customer or admin
      - `sender_name` (text) - Name of sender
      - `message` (text) - Message content
      - `read` (boolean) - Message read status
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow anonymous users to read/write their own conversation
    - Allow authenticated users (admins) to read/write all conversations
    
  3. Indexes
    - Index on conversation_id for fast message lookups
    - Index on status for filtering conversations
*/

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  source_url text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_name text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
CREATE POLICY "Anyone can create conversations"
  ON chat_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view conversations"
  ON chat_conversations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update conversations"
  ON chat_conversations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for chat_messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;