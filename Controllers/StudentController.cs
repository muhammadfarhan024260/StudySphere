using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudySphere.Repositories;

namespace StudySphere.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentRepository _studentRepository;

    public StudentController(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    [HttpPut("fcm-token")]
    public async Task<IActionResult> UpdateFcmToken([FromBody] FcmTokenRequest req)
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                   ?? User.FindFirst("sub");
        if (idClaim == null || !int.TryParse(idClaim.Value, out var studentId))
            return Unauthorized();

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null) return NotFound();

        student.FcmToken = req.FcmToken;
        await _studentRepository.UpdateAsync(student);

        return Ok(new { success = true });
    }
}

public class FcmTokenRequest
{
    public string FcmToken { get; set; } = string.Empty;
}
