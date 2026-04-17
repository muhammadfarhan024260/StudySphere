using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IGoalRepository
{
    Task<int> AddAsync(Goal goal);
    Task<bool> UpdateAsync(Goal goal);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Goal>> GetByStudentIdAsync(int studentId);
}
