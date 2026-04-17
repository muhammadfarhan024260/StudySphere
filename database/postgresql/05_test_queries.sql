-- =====================================================
-- 05_TEST_QUERIES.sql
-- Sample queries for testing Module 1 functionality
-- =====================================================

-- =====================================================
-- TEST 1: Insert a password reset token
-- =====================================================
INSERT INTO password_reset_token (student_id, token, expiry_time)
SELECT 
    student_id,
    'reset_token_' || md5(random()::text) || '_' || student_id,
    CURRENT_TIMESTAMP + INTERVAL '1 hour'
FROM student
WHERE email = 'ammad@bahria.edu'
LIMIT 1;

-- =====================================================
-- TEST 2: Validate a reset token
-- =====================================================
-- Get a valid token first
SELECT * FROM password_reset_token 
WHERE is_used = FALSE 
AND expiry_time > CURRENT_TIMESTAMP 
LIMIT 1;

-- Validate it using the stored procedure
-- SELECT * FROM sp_validate_reset_token('reset_token_xxxxx');

-- =====================================================
-- TEST 3: View all students with their data
-- =====================================================
SELECT 
    student_id,
    email,
    name,
    enrollment_number,
    is_active,
    created_date,
    last_login
FROM student
ORDER BY created_date DESC;

-- =====================================================
-- TEST 4: View all admins
-- =====================================================
SELECT 
    admin_id,
    email,
    name,
    is_active,
    created_date,
    last_login
FROM admin
ORDER BY created_date DESC;

-- =====================================================
-- TEST 5: View all reset tokens
-- =====================================================
SELECT 
    token_id,
    CASE 
        WHEN student_id IS NOT NULL THEN 'STUDENT'
        ELSE 'ADMIN'
    END AS user_type,
    student_id,
    admin_id,
    is_used,
    expiry_time,
    CASE 
        WHEN expiry_time > CURRENT_TIMESTAMP THEN 'VALID'
        ELSE 'EXPIRED'
    END AS token_status,
    created_date
FROM password_reset_token
ORDER BY created_date DESC;

-- =====================================================
-- TEST 6: Count reset tokens by status
-- =====================================================
SELECT 
    is_used,
    CASE 
        WHEN expiry_time > CURRENT_TIMESTAMP THEN 'VALID'
        ELSE 'EXPIRED'
    END AS status,
    COUNT(*) as count
FROM password_reset_token
GROUP BY is_used, status;

-- =====================================================
-- TEST 7: Find students with no recent login
-- =====================================================
SELECT 
    student_id,
    email,
    name,
    last_login,
    CASE 
        WHEN last_login IS NULL THEN 'Never logged in'
        ELSE 'Last login: ' || last_login::text
    END AS login_status
FROM student
WHERE last_login IS NULL OR last_login < CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY last_login;
