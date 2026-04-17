using StudySphere.Models;

namespace StudySphere.Services;

public interface IGoalService
{
    Task<int> CreateGoalAsync(Goal goal);
    Task<bool> UpdateGoalAsync(Goal goal);
    Task<bool> DeleteGoalAsync(int id);
    Task<IEnumerable<Goal>> GetStudentGoalsAsync(int studentId);
}
