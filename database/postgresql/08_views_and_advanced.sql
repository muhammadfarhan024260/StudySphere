-- =============================================
-- 08_VIEWS_AND_ADVANCED.sql
-- Lab 9  : Views  (vw_weekly_report)
-- Lab 12 : ROLLUP (analytics aggregation)
-- Lab 5  : Set Operations  (UNION / INTERSECT examples)
-- Lab 6  : Subqueries      (below-average detection)
-- =============================================

-- =============================================
-- Lab 9: CREATE VIEW — vw_weekly_report
-- Pre-joined weekly summary per student × subject.
-- Used by GET /api/studylog/student/{id}/weekly-report
-- =============================================
CREATE OR REPLACE VIEW vw_weekly_report AS
SELECT
    s.student_id,
    s.name                                          AS student_name,
    sub.subject_id,
    sub.name                                        AS subject_name,
    DATE_TRUNC('week', sl.date_logged)::DATE        AS week_start,
    COUNT(sl.log_id)                                AS session_count,
    ROUND(SUM(sl.hours_studied)::NUMERIC, 2)        AS total_hours,
    ROUND(AVG(sl.productivity_score)::NUMERIC, 1)   AS avg_productivity,
    MAX(sl.productivity_score)                      AS max_productivity
FROM study_log sl
INNER JOIN student s   ON s.student_id   = sl.student_id
INNER JOIN subject sub ON sub.subject_id = sl.subject_id
GROUP BY
    s.student_id,
    s.name,
    sub.subject_id,
    sub.name,
    DATE_TRUNC('week', sl.date_logged)::DATE
ORDER BY
    s.student_id,
    week_start DESC,
    total_hours DESC;


-- =============================================
-- Lab 12: ROLLUP — analytics aggregation
-- GROUP BY ROLLUP(student_id, subject_id, month)
-- NULL rows = subtotals / grand total.
-- Used by GET /api/admin/analytics/rollup
-- =============================================
-- (Sample query — executed at runtime by the backend)
-- SELECT
--     sl.student_id,
--     sl.subject_id,
--     sub.name                                     AS subject_name,
--     EXTRACT(YEAR  FROM sl.date_logged)::INT      AS year,
--     EXTRACT(MONTH FROM sl.date_logged)::INT      AS month,
--     COUNT(sl.log_id)                             AS session_count,
--     ROUND(SUM(sl.hours_studied)::NUMERIC, 2)     AS total_hours,
--     ROUND(AVG(sl.productivity_score)::NUMERIC,1) AS avg_productivity
-- FROM study_log sl
-- JOIN subject sub ON sub.subject_id = sl.subject_id
-- GROUP BY ROLLUP(
--     sl.student_id,
--     sl.subject_id, sub.name,
--     EXTRACT(YEAR FROM sl.date_logged),
--     EXTRACT(MONTH FROM sl.date_logged)
-- )
-- ORDER BY sl.student_id NULLS LAST,
--          sl.subject_id NULLS LAST,
--          year NULLS LAST,
--          month NULLS LAST;


-- =============================================
-- Lab 5: Set Operations — UNION
-- Subjects a student is engaged with:
--   studied in the last 7 days  UNION  has an active goal
-- Used by GET /api/studylog/student/{id}/study-scope
-- =============================================
-- SELECT sub.subject_id, sub.name, 'Studied'  AS source
-- FROM study_log sl JOIN subject sub ON sub.subject_id = sl.subject_id
-- WHERE sl.student_id = @p_student_id
--   AND sl.date_logged >= CURRENT_DATE - INTERVAL '7 days'
-- UNION
-- SELECT sub.subject_id, sub.name, 'Has Goal' AS source
-- FROM goal g JOIN subject sub ON sub.subject_id = g.subject_id
-- WHERE g.student_id = @p_student_id AND g.is_completed = FALSE;


-- =============================================
-- Lab 5: Set Operations — INTERSECT
-- Admin: students who both logged a session this week
--        AND still have an active (incomplete) goal
-- Used by GET /api/admin/analytics/engaged-students
-- =============================================
-- SELECT student_id FROM study_log
--  WHERE date_logged >= CURRENT_DATE - INTERVAL '7 days'
-- INTERSECT
-- SELECT student_id FROM goal WHERE is_completed = FALSE;


-- =============================================
-- Lab 6: Subquery — below-average students
-- Students whose personal avg productivity < system-wide avg
-- Used by GET /api/admin/analytics/below-average
-- =============================================
-- SELECT s.student_id, s.name, s.email,
--        ROUND(AVG(sl.productivity_score)::NUMERIC, 1) AS avg_score
-- FROM student s
-- JOIN study_log sl ON sl.student_id = s.student_id
-- GROUP BY s.student_id, s.name, s.email
-- HAVING AVG(sl.productivity_score) < (
--     SELECT AVG(productivity_score) FROM study_log
-- )
-- ORDER BY avg_score ASC;
