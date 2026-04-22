-- =============================================
-- Module 4: Intelligence & Notifications
-- Owner: Arbaz Khan Orakzai
-- Conventions: snake_case, PostgreSQL
-- Depends on: student, admin (Module 1), subject, study_log (Module 2)
-- =============================================


-- =============================================
-- 1. DDL: Tables
-- =============================================

-- weak_area: auto-populated by trigger when a student's avg productivity
-- on a subject drops below 50.
CREATE TABLE IF NOT EXISTS weak_area (
    weak_area_id   SERIAL PRIMARY KEY,
    student_id     INT NOT NULL,
    subject_id     INT NOT NULL,
    avg_score      DECIMAL(5, 2) NOT NULL,
    detected_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weak_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_weak_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
    CONSTRAINT uq_weak_student_subject UNIQUE (student_id, subject_id)
);

-- recommendation: admin-authored guidance attached to a subject.
-- Surfaced to a student when their avg score on that subject is below
-- min_score_threshold.
CREATE TABLE IF NOT EXISTS recommendation (
    recommendation_id    SERIAL PRIMARY KEY,
    subject_id           INT NOT NULL,
    admin_id             INT NOT NULL,
    title                VARCHAR(150) NOT NULL,
    content              TEXT NOT NULL,
    min_score_threshold  INT NOT NULL DEFAULT 50 CHECK (min_score_threshold BETWEEN 0 AND 100),
    created_date         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reco_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
    CONSTRAINT fk_reco_admin   FOREIGN KEY (admin_id)   REFERENCES admin(admin_id)   ON DELETE CASCADE
);

-- notification: per-student alerts. Created automatically by the trigger
-- when a weak area is detected. type discriminates source ('weak_area',
-- 'recommendation').
CREATE TABLE IF NOT EXISTS notification (
    notification_id     SERIAL PRIMARY KEY,
    student_id          INT NOT NULL,
    related_subject_id  INT,
    type                VARCHAR(20) NOT NULL CHECK (type IN ('weak_area', 'recommendation')),
    message             TEXT NOT NULL,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    created_date        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_student FOREIGN KEY (student_id)         REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_subject FOREIGN KEY (related_subject_id) REFERENCES subject(subject_id) ON DELETE SET NULL
);


-- =============================================
-- 2. Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_weak_area_student     ON weak_area(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_subject ON recommendation(subject_id);
CREATE INDEX IF NOT EXISTS idx_notification_student  ON notification(student_id, is_read);


-- =============================================
-- 3. AFTER INSERT trigger on study_log
--    Recomputes the student's avg productivity for the affected subject.
--    If avg < 50: upsert weak_area + insert a notification.
-- =============================================
CREATE OR REPLACE FUNCTION fn_flag_weak_area()
RETURNS TRIGGER AS $$
DECLARE
    v_avg          DECIMAL(5, 2);
    v_subject_name VARCHAR(100);
BEGIN
    SELECT AVG(productivity_score)
      INTO v_avg
      FROM study_log
     WHERE student_id = NEW.student_id
       AND subject_id = NEW.subject_id;

    IF v_avg IS NOT NULL AND v_avg < 50 THEN
        INSERT INTO weak_area (student_id, subject_id, avg_score)
        VALUES (NEW.student_id, NEW.subject_id, v_avg)
        ON CONFLICT (student_id, subject_id)
        DO UPDATE SET avg_score = EXCLUDED.avg_score,
                      detected_date = CURRENT_TIMESTAMP;

        SELECT name INTO v_subject_name FROM subject WHERE subject_id = NEW.subject_id;

        INSERT INTO notification (student_id, related_subject_id, type, message)
        VALUES (
            NEW.student_id,
            NEW.subject_id,
            'weak_area',
            'Low average productivity (' || ROUND(v_avg, 1) || ') on ' || COALESCE(v_subject_name, 'subject')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flag_weak_area ON study_log;
CREATE TRIGGER trg_flag_weak_area
AFTER INSERT ON study_log
FOR EACH ROW EXECUTE FUNCTION fn_flag_weak_area();


-- =============================================
-- 4. Stored procedure: sp_get_weak_subjects
--    Returns subjects flagged for a given student.
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_weak_subjects(p_student_id INT)
RETURNS TABLE (
    subject_id    INT,
    subject_name  VARCHAR(100),
    avg_score     DECIMAL(5, 2),
    detected_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.subject_id, s.name, w.avg_score, w.detected_date
      FROM weak_area w
      INNER JOIN subject s ON s.subject_id = w.subject_id
     WHERE w.student_id = p_student_id
     ORDER BY w.avg_score ASC;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- 5. Sample 4-table JOIN: admin recommendations enriched with reach.
--    Joins recommendation × subject × admin (INNER) and weak_area (LEFT)
--    to show how many students each recommendation currently applies to.
-- =============================================
-- SELECT r.recommendation_id,
--        r.title,
--        s.name           AS subject_name,
--        a.name           AS authored_by,
--        COUNT(w.weak_area_id) AS impacted_students
--   FROM recommendation r
--   INNER JOIN subject s ON s.subject_id = r.subject_id
--   INNER JOIN admin   a ON a.admin_id   = r.admin_id
--   LEFT  JOIN weak_area w ON w.subject_id = r.subject_id
--                         AND w.avg_score  < r.min_score_threshold
--  GROUP BY r.recommendation_id, r.title, s.name, a.name
--  ORDER BY impacted_students DESC;
