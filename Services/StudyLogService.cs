using StudySphere.Models;
using StudySphere.Repositories;

namespace StudySphere.Services;

public class StudyLogService : IStudyLogService
{
    private readonly IStudyLogRepository _repository;

    public StudyLogService(IStudyLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<int> LogSessionAsync(StudyLog log)
    {
        return await _repository.AddAsync(log);
    }

    public async Task<bool> UpdateSessionAsync(StudyLog log)
    {
        return await _repository.UpdateAsync(log);
    }

    public async Task<bool> DeleteSessionAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<StudyLog>> GetStudentLogsAsync(int studentId)
    {
        // Using the JOIN query as requested in requirements
        return await _repository.GetAllWithSubjectNamesAsync(studentId);
    }
}
