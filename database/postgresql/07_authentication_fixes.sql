-- =====================================================
-- 07_AUTHENTICATION_FIXES.sql
-- Repair script for existing databases using the OTP signup flow
-- Run this after 01_create_tables.sql / 02_create_indexes.sql if the
-- otp_verification table was created with the old unique constraint.
-- =====================================================

-- Drop any unique constraint on otp_verification so multiple OTP rows can be
-- managed by the application lifecycle instead of a brittle composite unique key.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT con.conname
    INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'otp_verification'
      AND con.contype = 'u'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE otp_verification DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Helpful indexes for the OTP lookup and cleanup path.
CREATE INDEX IF NOT EXISTS idx_otp_email_user_type ON otp_verification(email, user_type);
CREATE INDEX IF NOT EXISTS idx_otp_status ON otp_verification(is_verified, is_used);
CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_verification(expiry_time);