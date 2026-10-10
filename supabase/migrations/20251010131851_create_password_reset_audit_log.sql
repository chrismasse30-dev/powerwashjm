/*
  # Password Reset Audit Log

  1. New Tables
    - `password_reset_audit`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users table)
      - `user_email` (text, email of user whose password was reset)
      - `admin_id` (uuid, optional reference to admin who performed action)
      - `admin_email` (text, email of admin who performed the reset)
      - `reset_method` (text, method used: 'admin_reset', 'self_service', etc.)
      - `ip_address` (text, IP address of request)
      - `user_agent` (text, browser/device info)
      - `status` (text, 'initiated', 'completed', 'failed', 'expired')
      - `reset_token_sent` (boolean, whether email was sent)
      - `notes` (text, additional context)
      - `created_at` (timestamptz, when action occurred)
      - `completed_at` (timestamptz, when user completed password change)

  2. Security
    - Enable RLS on `password_reset_audit` table
    - Only admins can read audit logs
    - System can insert audit records
    - No updates or deletes allowed (audit immutability)

  3. Indexes
    - Index on user_email for quick lookups
    - Index on admin_email for admin activity tracking
    - Index on created_at for time-based queries
*/

-- Create password reset audit log table
CREATE TABLE IF NOT EXISTS password_reset_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  admin_id uuid,
  admin_email text NOT NULL,
  reset_method text DEFAULT 'admin_reset',
  ip_address text,
  user_agent text,
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'completed', 'failed', 'expired')),
  reset_token_sent boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_audit_user_email ON password_reset_audit(user_email);
CREATE INDEX IF NOT EXISTS idx_password_reset_audit_admin_email ON password_reset_audit(admin_email);
CREATE INDEX IF NOT EXISTS idx_password_reset_audit_created_at ON password_reset_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_audit_status ON password_reset_audit(status);

-- Enable Row Level Security
ALTER TABLE password_reset_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can read audit logs
CREATE POLICY "Admins can read password reset audit logs"
  ON password_reset_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = auth.jwt()->>'email'
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Policy: System can insert audit records (no user restriction for logging)
CREATE POLICY "System can insert password reset audit logs"
  ON password_reset_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE password_reset_audit IS 'Audit trail for all password reset actions performed by administrators';
COMMENT ON COLUMN password_reset_audit.reset_method IS 'Method used for reset: admin_reset, self_service, support_ticket, etc.';
COMMENT ON COLUMN password_reset_audit.status IS 'Current status: initiated, completed, failed, or expired';
