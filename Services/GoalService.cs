using StudySphere.Models;
using StudySphere.Repositories;

namespace StudySphere.Services;

public class GoalService : IGoalService
{
    private readonly IGoalRepository _repository;

    public GoalService(IGoalRepository repository)
    {
        _repository = repository;
    }

    public async Task<int> CreateGoalAsync(Goal goal)
    {
        return await _repository.AddAsync(goal);
    }

    public async Task<bool> UpdateGoalAsync(Goal goal)
    {
        return await _repository.UpdateAsync(goal);
    }

    public async Task<bool> DeleteGoalAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<Goal>> GetStudentGoalsAsync(int studentId)
    {
        return await _repository.GetByStudentIdAsync(studentId);
    }
}
