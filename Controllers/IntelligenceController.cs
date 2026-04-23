using Microsoft.AspNetCore.Mvc;
using StudySphere.Models;
using StudySphere.Services;

namespace StudySphere.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntelligenceController : ControllerBase
{
    private readonly IIntelligenceService _service;

    public IntelligenceController(IIntelligenceService service)
    {
        _service = service;
    }

    // ---------------- Student endpoints ----------------

    [HttpGet("student/{studentId}/weak-subjects")]
    public async Task<IActionResult> GetWeakSubjects(int studentId)
        => Ok(await _service.GetWeakSubjectsAsync(studentId));

    [HttpGet("student/{studentId}/notifications")]
    public async Task<IActionResult> GetNotifications(int studentId)
        => Ok(await _service.GetNotificationsAsync(studentId));

    [HttpPut("notifications/{notificationId}/read")]
    public async Task<IActionResult> MarkRead(int notificationId)
    {
        var ok = await _service.MarkNotificationReadAsync(notificationId);
        return ok ? Ok(new { Message = "Marked as read." }) : NotFound();
    }

    [HttpGet("student/{studentId}/recommendations")]
    public async Task<IActionResult> GetStudentRecommendations(int studentId)
        => Ok(await _service.GetRecommendationsForStudentAsync(studentId));

    // ---------------- Admin endpoints ----------------

    [HttpGet("recommendations")]
    public async Task<IActionResult> GetAllRecommendations()
        => Ok(await _service.GetAllRecommendationsAsync());

    [HttpPost("recommendations")]
    public async Task<IActionResult> CreateRecommendation([FromBody] Recommendation recommendation)
    {
        var id = await _service.CreateRecommendationAsync(recommendation);
        return Ok(new { RecommendationId = id, Message = "Recommendation created." });
    }

    [HttpPut("recommendations/{id}")]
    public async Task<IActionResult> UpdateRecommendation(int id, [FromBody] Recommendation recommendation)
    {
        recommendation.RecommendationId = id;
        var ok = await _service.UpdateRecommendationAsync(recommendation);
        return ok ? Ok(new { Message = "Recommendation updated." }) : NotFound();
    }

    [HttpDelete("recommendations/{id}")]
    public async Task<IActionResult> DeleteRecommendation(int id)
    {
        var ok = await _service.DeleteRecommendationAsync(id);
        return ok ? Ok(new { Message = "Recommendation deleted." }) : NotFound();
    }
}
