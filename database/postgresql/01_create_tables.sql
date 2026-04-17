-- =====================================================
-- 01_CREATE_TABLES.sql
-- Create all tables for Module 1: Auth & Security
-- =====================================================

-- Student Table
CREATE TABLE IF NOT EXISTS student (
    student_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Token Table
CREATE TABLE IF NOT EXISTS password_reset_token (
    token_id SERIAL PRIMARY KEY,
    student_id INT,
    admin_id INT,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_date TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE CASCADE,
    CHECK (
        (student_id IS NOT NULL AND admin_id IS NULL) OR 
        (student_id IS NULL AND admin_id IS NOT NULL)
    )
);

-- Add comments to tables
COMMENT ON TABLE student IS 'Stores student user information for authentication';
COMMENT ON TABLE admin IS 'Stores admin user information for authentication';
COMMENT ON TABLE password_reset_token IS 'Manages password reset tokens with expiry validation';

-- Add comments to columns
COMMENT ON COLUMN student.password_hash IS 'BCrypt hashed password for security';
COMMENT ON COLUMN student.enrollment_number IS 'University enrollment/registration number';
COMMENT ON COLUMN admin.password_hash IS 'BCrypt hashed password for security';
COMMENT ON COLUMN password_reset_token.token IS 'Unique token for password reset';
COMMENT ON COLUMN password_reset_token.expiry_time IS 'Token expiration timestamp';
COMMENT ON COLUMN password_reset_token.is_used IS 'Flag to prevent token reuse';
