-- =====================================================
-- 03_STORED_PROCEDURES.sql
-- Create stored procedures for authentication workflows
-- =====================================================

-- =====================================================
-- STORED PROCEDURE: sp_ResetPassword
-- Description: Reset user password with token validation
-- Parameters:
--   p_token: The reset token to validate
--   p_new_password: New BCrypt hashed password
--   p_user_type: 'STUDENT' or 'ADMIN'
-- Returns: Success or error message
-- =====================================================
CREATE OR REPLACE FUNCTION sp_reset_password(
    p_token VARCHAR(255),
    p_new_password VARCHAR(255),
    p_user_type VARCHAR(20)
)
RETURNS TABLE (
    success BOOLEAN,
    message VARCHAR(255),
    user_id INT
) AS $$
DECLARE
    v_token_id INT;
    v_student_id INT;
    v_admin_id INT;
    v_expiry_time TIMESTAMP;
    v_is_used BOOLEAN;
BEGIN
    -- Find the token
    SELECT token_id, student_id, admin_id, expiry_time, is_used
    INTO v_token_id, v_student_id, v_admin_id, v_expiry_time, v_is_used
    FROM password_reset_token
    WHERE token = p_token
    LIMIT 1;

    -- Check if token exists
    IF v_token_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Token not found'::VARCHAR(255), NULL::INT;
        RETURN;
    END IF;

    -- Check if token is already used
    IF v_is_used THEN
        RETURN QUERY SELECT FALSE, 'Token already used'::VARCHAR(255), NULL::INT;
        RETURN;
    END IF;

    -- Check if token is expired
    IF v_expiry_time < CURRENT_TIMESTAMP THEN
        RETURN QUERY SELECT FALSE, 'Token expired'::VARCHAR(255), NULL::INT;
        RETURN;
    END IF;

    -- Update password based on user type
    IF p_user_type = 'STUDENT' THEN
        UPDATE student
        SET password_hash = p_new_password,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = v_student_id;
        
        RETURN QUERY SELECT TRUE, 'Password reset successful'::VARCHAR(255), v_student_id;
        
    ELSIF p_user_type = 'ADMIN' THEN
        UPDATE admin
        SET password_hash = p_new_password,
            updated_at = CURRENT_TIMESTAMP
        WHERE admin_id = v_admin_id;
        
        RETURN QUERY SELECT TRUE, 'Password reset successful'::VARCHAR(255), v_admin_id;
    ELSE
        RETURN QUERY SELECT FALSE, 'Invalid user type'::VARCHAR(255), NULL::INT;
        RETURN;
    END IF;

    -- Mark token as used
    UPDATE password_reset_token
    SET is_used = TRUE,
        used_date = CURRENT_TIMESTAMP
    WHERE token_id = v_token_id;

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORED PROCEDURE: sp_ValidateResetToken
-- Description: Validate if a reset token is still valid
-- Parameters:
--   p_token: The reset token to validate
-- Returns: Validation result
-- =====================================================
CREATE OR REPLACE FUNCTION sp_validate_reset_token(p_token VARCHAR(255))
RETURNS TABLE (
    is_valid BOOLEAN,
    message VARCHAR(255),
    user_type VARCHAR(20)
) AS $$
DECLARE
    v_token_id INT;
    v_student_id INT;
    v_admin_id INT;
    v_expiry_time TIMESTAMP;
    v_is_used BOOLEAN;
BEGIN
    SELECT token_id, student_id, admin_id, expiry_time, is_used
    INTO v_token_id, v_student_id, v_admin_id, v_expiry_time, v_is_used
    FROM password_reset_token
    WHERE token = p_token
    LIMIT 1;

    IF v_token_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Token not found'::VARCHAR(255), NULL::VARCHAR(20);
        RETURN;
    END IF;

    IF v_is_used THEN
        RETURN QUERY SELECT FALSE, 'Token already used'::VARCHAR(255), NULL::VARCHAR(20);
        RETURN;
    END IF;

    IF v_expiry_time < CURRENT_TIMESTAMP THEN
        RETURN QUERY SELECT FALSE, 'Token expired'::VARCHAR(255), NULL::VARCHAR(20);
        RETURN;
    END IF;

    IF v_student_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'Token valid'::VARCHAR(255), 'STUDENT'::VARCHAR(20);
    ELSE
        RETURN QUERY SELECT TRUE, 'Token valid'::VARCHAR(255), 'ADMIN'::VARCHAR(20);
    END IF;

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORED PROCEDURE: sp_CleanupExpiredTokens
-- Description: Clean up expired and used tokens (for maintenance)
-- =====================================================
CREATE OR REPLACE FUNCTION sp_cleanup_expired_tokens()
RETURNS TABLE (
    deleted_count INT
) AS $$
DECLARE
    v_deleted_count INT;
BEGIN
    DELETE FROM password_reset_token
    WHERE is_used = TRUE 
       OR expiry_time < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;
