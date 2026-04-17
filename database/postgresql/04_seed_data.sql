-- =====================================================
-- 04_SEED_DATA.sql
-- Insert sample data for testing
-- =====================================================

-- Insert Sample Students
INSERT INTO student (email, password_hash, name, enrollment_number) VALUES
(
    'ammad@bahria.edu',
    '$2a$11$8JZXy.9fY7L8z5p3m2k1dO.dK4h9X0C7b5e2j6L8m9O1P2Q3r4S5t6',
    'Ammad Ahmed',
    'BU-21-001'
),
(
    'ali.khan@bahria.edu',
    '$2a$11$8JZXy.9fY7L8z5p3m2k1dO.dK4h9X0C7b5e2j6L8m9O1P2Q3r4S5t6',
    'Ali Khan',
    'BU-21-002'
),
(
    'fatima.hassan@bahria.edu',
    '$2a$11$8JZXy.9fY7L8z5p3m2k1dO.dK4h9X0C7b5e2j6L8m9O1P2Q3r4S5t6',
    'Fatima Hassan',
    'BU-21-003'
)
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Admins
INSERT INTO admin (email, password_hash, name) VALUES
(
    'admin@bahria.edu',
    '$2a$11$8JZXy.9fY7L8z5p3m2k1dO.dK4h9X0C7b5e2j6L8m9O1P2Q3r4S5t6',
    'System Admin'
),
(
    'professor.ahmed@bahria.edu',
    '$2a$11$8JZXy.9fY7L8z5p3m2k1dO.dK4h9X0C7b5e2j6L8m9O1P2Q3r4S5t6',
    'Dr. Ahmed'
)
ON CONFLICT (email) DO NOTHING;

-- Note: The password_hash above is a sample BCrypt hash
-- In production, these should be actual BCrypt hashed passwords
-- Sample passwords represented: 'password123'
