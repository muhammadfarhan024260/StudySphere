using Microsoft.AspNetCore.Mvc;
using StudySphere.Models;
using StudySphere.Facades;

namespace StudySphere.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudyLogController : ControllerBase
{
    private readonly StudyPlannerFacade _facade;

    public StudyLogController(StudyPlannerFacade facade)
    {
        _facade = facade;
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
}
