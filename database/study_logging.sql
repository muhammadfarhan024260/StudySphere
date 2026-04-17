-- =============================================
-- 1. DDL: Tables Creation (Universal snake_case)
-- =============================================

-- Subject Table
CREATE TABLE IF NOT EXISTS subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    target_hours DECIMAL(5, 2)
);

-- StudyLog Table
CREATE TABLE IF NOT EXISTS study_log (
    log_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    hours_studied DECIMAL(5, 2),
    productivity_score INT CHECK (productivity_score >= 0 AND productivity_score <= 100),
    date_logged DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    CONSTRAINT fk_student_log FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_subject_log FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
);

-- Goal Table
CREATE TABLE IF NOT EXISTS goal (
    goal_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    goal_type VARCHAR(20) CHECK (goal_type IN ('weekly', 'monthly')),
    target_hours DECIMAL(5, 2),
    deadline DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_student_goal FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_subject_goal FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
);

-- =============================================
-- 2. Indexing
-- =============================================
CREATE INDEX IF NOT EXISTS idx_study_log_student_id ON study_log(student_id);
CREATE INDEX IF NOT EXISTS idx_study_log_subject_id ON study_log(subject_id);

-- =============================================
-- 3. DML Operations (Samples)
-- =============================================

-- Add a study session into study_log
-- INSERT INTO study_log (student_id, subject_id, hours_studied, productivity_score, date_logged, notes) 
-- VALUES (1, 1, 2.5, 85, CURRENT_DATE, 'Studied Database Normalization');

-- Add a goal
-- INSERT INTO goal (student_id, subject_id, goal_type, target_hours, deadline) 
-- VALUES (1, 1, 'weekly', 10, '2024-05-01');

-- UPDATE study session
-- UPDATE study_log 
-- SET hours_studied = 3.0, notes = 'Extended session', productivity_score = 90 
-- WHERE log_id = 1;

-- UPDATE goal
-- UPDATE goal SET is_completed = TRUE WHERE goal_id = 1;

-- =============================================
-- 4. SELECT Queries
-- =============================================

-- Get history
-- SELECT sl.*, s.name as subject_name 
-- FROM study_log sl 
-- JOIN subject s ON sl.subject_id = s.subject_id
-- WHERE sl.student_id = 1
-- ORDER BY sl.date_logged DESC;
