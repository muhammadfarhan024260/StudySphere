using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;
using StudySphere.Facades;

namespace StudySphere.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudyLogController : ControllerBase
{
    private readonly StudyPlannerFacade _facade;
    private readonly StudySphereDbContext _studyScopeContext;

    public StudyLogController(StudyPlannerFacade facade, StudySphereDbContext context)
    {
        _facade = facade;
        _studyScopeContext = context;
    }

    [HttpPost("session")]
    public async Task<IActionResult> LogSession([FromBody] StudyLog log)
    {
        try
        {
            var id = await _facade.LogSession(log);
            return Ok(new { LogId = id, Message = "Study session logged successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("goal")]
    public async Task<IActionResult> SetGoal([FromBody] Goal goal)
    {
        try
        {
            var id = await _facade.SetGoal(goal);
            return Ok(new { GoalId = id, Message = "Study goal set successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("goal/{id}")]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        try
        {
            var result = await _facade.DeleteGoal(id);
            if (!result) return NotFound(new { Error = "Goal not found." });
            return Ok(new { Message = "Goal deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("student/{studentId}/history")]
    public async Task<IActionResult> GetHistory(int studentId)
    {
        var history = await _facade.GetStudentHistory(studentId);
        return Ok(history);
    }

    [HttpGet("student/{studentId}/goals")]
    public async Task<IActionResult> GetGoals(int studentId)
    {
        var goals = await _facade.GetStudentGoals(studentId);
        return Ok(goals);
    }

    // Lab 9: vw_weekly_report
    [HttpGet("student/{studentId}/weekly-report")]
    public async Task<IActionResult> GetWeeklyReport(int studentId)
    {
        var report = await _facade.GetWeeklyReport(studentId);
        return Ok(report);
    }

    // Lab 5 UNION: subjects studied in last 7 days OR has an active goal
    [HttpGet("student/{studentId}/study-scope")]
    public async Task<IActionResult> GetStudyScope(int studentId)
    {
        var weekAgo = DateTime.Today.AddDays(-7);

        var studiedIds = await _studyScopeContext.StudyLogs
            .Where(sl => sl.StudentId == studentId && sl.DateLogged >= weekAgo)
            .Select(sl => sl.SubjectId)
            .Distinct()
            .ToListAsync();

        var goalIds = await _studyScopeContext.Goals
            .Where(g => g.StudentId == studentId && !g.IsCompleted)
            .Select(g => g.SubjectId)
            .Distinct()
            .ToListAsync();

        var allIds = studiedIds.Union(goalIds).ToList();
        var subjects = await _studyScopeContext.Subjects
            .Where(s => allIds.Contains(s.SubjectId))
            .ToListAsync();

        var result = subjects.Select(s => new
        {
            subjectId   = s.SubjectId,
            subjectName = s.Name,
            source      = studiedIds.Contains(s.SubjectId) && goalIds.Contains(s.SubjectId)
                              ? "Studied & Has Goal"
                              : studiedIds.Contains(s.SubjectId) ? "Studied" : "Has Goal"
        });

        return Ok(result);
    }
}
