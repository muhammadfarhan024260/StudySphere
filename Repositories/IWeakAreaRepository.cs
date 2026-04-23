using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IWeakAreaRepository
{
    Task<IEnumerable<WeakArea>> GetByStudentIdAsync(int studentId);
}
