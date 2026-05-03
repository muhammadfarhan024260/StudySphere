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
    private readonly IIntelligenceService _intelligenceService;

    public StudyPlannerFacade(IStudyLogService studyLogService, IGoalService goalService, IIntelligenceService intelligenceService)
    {
        _studyLogService = studyLogService;
        _goalService = goalService;
        _intelligenceService = intelligenceService;
    }

    public async Task<int> LogSession(StudyLog log)
    {
        int logId = await _studyLogService.LogSessionAsync(log);
        // Fire and forget, or await. Let's await to ensure consistency for now.
        await _intelligenceService.AnalyzeSessionAsync(log.StudentId, log.SubjectId);
        return logId;
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

    // Lab 9
    public async Task<IEnumerable<WeeklyReportEntry>> GetWeeklyReport(int studentId)
    {
        return await _studyLogService.GetWeeklyReportAsync(studentId);
    }
}
