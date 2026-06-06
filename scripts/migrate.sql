-- Migration: Add new fields for CLG platform upgrades
-- Run this against your Supabase PostgreSQL database

-- 1. Create new enums (if not exist)
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Update users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_expiry TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_expiry TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bank_country TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- For existing users, mark email as confirmed so they can still log in
UPDATE users SET email_confirmed = TRUE WHERE email_confirmed = FALSE;

-- 3. Update applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS approved_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS release_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_released BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS available_balance NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT,
  ADD COLUMN IF NOT EXISTS processing_fee_kes NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS document_paths TEXT,
  ADD COLUMN IF NOT EXISTS payout_bank_country TEXT,
  ADD COLUMN IF NOT EXISTS payout_bank_name TEXT,
  ADD COLUMN IF NOT EXISTS payout_bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS payout_bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS payout_swift_code TEXT;

-- 4. Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  application_id INTEGER NOT NULL REFERENCES applications(id),
  amount NUMERIC(12,2) NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  bank_country TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  swift_code TEXT,
  admin_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_applications_release_date ON applications(release_date);
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

SELECT 'Migration completed successfully' AS result;
