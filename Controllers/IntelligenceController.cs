using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudySphere.Data;
using StudySphere.Models;
using StudySphere.Patterns.Decorator;
using StudySphere.Repositories;
using StudySphere.Services;

namespace StudySphere.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IntelligenceController : ControllerBase
{
    private readonly IIntelligenceService _service;
    private readonly NotificationDeliveryService _deliveryService;
    private readonly StudySphereDbContext _context;
    private readonly IStudentRepository _studentRepository;

    public IntelligenceController(
        IIntelligenceService service,
        NotificationDeliveryService deliveryService,
        StudySphereDbContext context,
        IStudentRepository studentRepository)
    {
        _service = service;
        _deliveryService = deliveryService;
        _context = context;
        _studentRepository = studentRepository;
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

    // Decorator Pattern — deliver a notification through the selected channel chain
    [HttpPost("notifications/{notificationId}/deliver")]
    public async Task<IActionResult> DeliverNotification(
        int notificationId,
        [FromQuery] bool email = true,
        [FromQuery] bool sms   = false,
        [FromQuery] bool push  = false)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification is null)
            return NotFound(new { success = false, message = "Notification not found." });

        var student = await _studentRepository.GetByIdAsync(notification.StudentId);
        if (student is null)
            return NotFound(new { success = false, message = "Student not found." });

        var chain = _deliveryService.BuildChain(email, sms, push);
        await chain.DeliverAsync(notification, student);

        return Ok(new
        {
            success  = true,
            message  = "Notification delivered via selected channels.",
            channels = new { email, whatsapp = sms, push }
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetAllRecommendations()
        => Ok(await _service.GetAllRecommendationsAsync());

    [Authorize(Roles = "Admin")]
    [HttpPost("recommendations")]
    public async Task<IActionResult> CreateRecommendation([FromBody] Recommendation recommendation)
    {
        var id = await _service.CreateRecommendationAsync(recommendation);
        return Ok(new { RecommendationId = id, Message = "Recommendation created." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("recommendations/{id}")]
    public async Task<IActionResult> UpdateRecommendation(int id, [FromBody] Recommendation recommendation)
    {
        recommendation.RecommendationId = id;
        var ok = await _service.UpdateRecommendationAsync(recommendation);
        return ok ? Ok(new { Message = "Recommendation updated." }) : NotFound();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("recommendations/{id}")]
    public async Task<IActionResult> DeleteRecommendation(int id)
    {
        var ok = await _service.DeleteRecommendationAsync(id);
        return ok ? Ok(new { Message = "Recommendation deleted." }) : NotFound();
    }
}
