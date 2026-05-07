using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IWeakAreaRepository
{
    Task<IEnumerable<WeakArea>> GetByStudentIdAsync(int studentId);
    Task<WeakArea?> GetByStudentAndSubjectAsync(int studentId, int subjectId);
    Task<WeakArea> CreateAsync(WeakArea weakArea);
    Task UpdateAsync(WeakArea weakArea);
    Task DeleteAsync(int weakAreaId);
}
