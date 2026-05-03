using StudySphere.Models;

namespace StudySphere.Services;

public interface IStudyLogService
{
    Task<int> LogSessionAsync(StudyLog log);
    Task<bool> UpdateSessionAsync(StudyLog log);
    Task<bool> DeleteSessionAsync(int id);
    Task<IEnumerable<StudyLog>> GetStudentLogsAsync(int studentId);
    // Lab 9
    Task<IEnumerable<WeeklyReportEntry>> GetWeeklyReportAsync(int studentId);
}
