-- =====================================================
-- 02_CREATE_INDEXES.sql
-- Create indexes for optimized query performance
-- =====================================================

-- Index on Student email for fast login lookup
CREATE INDEX IF NOT EXISTS idx_student_email ON student(email);

-- Index on Student enrollment number for quick lookup
CREATE INDEX IF NOT EXISTS idx_student_enrollment ON student(enrollment_number);

-- Index on Student active status for filtering
CREATE INDEX IF NOT EXISTS idx_student_active ON student(is_active);

-- Index on Admin email for fast login lookup
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);

-- Index on Admin active status
CREATE INDEX IF NOT EXISTS idx_admin_active ON admin(is_active);

-- Indexes on OTP verification for signup flow
CREATE INDEX IF NOT EXISTS idx_otp_email_user_type ON otp_verification(email, user_type);
CREATE INDEX IF NOT EXISTS idx_otp_status ON otp_verification(is_verified, is_used);
CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_verification(expiry_time);

-- Index on Password Reset Token for token validation
CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_token(token);

-- Index on Password Reset Token expiry for cleanup queries
CREATE INDEX IF NOT EXISTS idx_reset_token_expiry ON password_reset_token(expiry_time);

-- Index on Password Reset Token used flag
CREATE INDEX IF NOT EXISTS idx_reset_token_used ON password_reset_token(is_used);

-- Index on Password Reset Token student_id for finding tokens by student
CREATE INDEX IF NOT EXISTS idx_reset_token_student ON password_reset_token(student_id);

-- Index on Password Reset Token admin_id for finding tokens by admin
CREATE INDEX IF NOT EXISTS idx_reset_token_admin ON password_reset_token(admin_id);
