-- =====================================================
-- 06_DROP_ALL.sql
-- Reset database - Delete all Module 1 data and structures
-- ⚠️ WARNING: This will delete all tables and data!
-- =====================================================

-- Drop functions/stored procedures first (they depend on tables)
DROP FUNCTION IF EXISTS sp_cleanup_expired_tokens() CASCADE;
DROP FUNCTION IF EXISTS sp_validate_reset_token(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS sp_reset_password(VARCHAR, VARCHAR, VARCHAR) CASCADE;

-- Drop tables (CASCADE deletes dependent objects)
DROP TABLE IF EXISTS password_reset_token CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS student CASCADE;

-- Drop all indexes
DROP INDEX IF EXISTS idx_student_email;
DROP INDEX IF EXISTS idx_student_enrollment;
DROP INDEX IF EXISTS idx_student_active;
DROP INDEX IF EXISTS idx_admin_email;
DROP INDEX IF EXISTS idx_admin_active;
DROP INDEX IF EXISTS idx_reset_token;
DROP INDEX IF EXISTS idx_reset_token_expiry;
DROP INDEX IF EXISTS idx_reset_token_used;
DROP INDEX IF EXISTS idx_reset_token_student;
DROP INDEX IF EXISTS idx_reset_token_admin;

COMMIT;

-- =====================================================
-- Verification: Check if everything is deleted
-- =====================================================
-- SELECT 'All Module 1 objects successfully deleted!' as message;
