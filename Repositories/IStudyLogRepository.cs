using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IStudyLogRepository
{
    Task<int> AddAsync(StudyLog log);
    Task<bool> UpdateAsync(StudyLog log);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<StudyLog>> GetByStudentIdAsync(int studentId);
    Task<IEnumerable<StudyLog>> GetAllWithSubjectNamesAsync(int studentId);
    // Lab 9 — queries vw_weekly_report
    Task<IEnumerable<WeeklyReportEntry>> GetWeeklyReportAsync(int studentId);
}
