using StudySphere.Models;

namespace StudySphere.Services;

public interface IStudyLogService
{
    Task<int> LogSessionAsync(StudyLog log);
    Task<bool> UpdateSessionAsync(StudyLog log);
    Task<bool> DeleteSessionAsync(int id);
    Task<IEnumerable<StudyLog>> GetStudentLogsAsync(int studentId);
}
