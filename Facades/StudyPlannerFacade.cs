using StudySphere.Models;
using StudySphere.Services;

namespace StudySphere.Facades;

/// <summary>
/// Façade Pattern implementation to simplify access to system operations.
/// </summary>
public class StudyPlannerFacade
{
    private readonly IStudyLogService _studyLogService;
    private readonly IGoalService _goalService;

    public StudyPlannerFacade(IStudyLogService studyLogService, IGoalService goalService)
    {
        _studyLogService = studyLogService;
        _goalService = goalService;
    }

    public async Task<int> LogSession(StudyLog log)
    {
        return await _studyLogService.LogSessionAsync(log);
    }

    public async Task<int> SetGoal(Goal goal)
    {
        return await _goalService.CreateGoalAsync(goal);
    }

    public async Task<IEnumerable<StudyLog>> GetStudentHistory(int studentId)
    {
        return await _studyLogService.GetStudentLogsAsync(studentId);
    }

    public async Task<IEnumerable<Goal>> GetStudentGoals(int studentId)
    {
        return await _goalService.GetStudentGoalsAsync(studentId);
    }
}
