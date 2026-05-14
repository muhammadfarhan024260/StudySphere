using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudySphere.Repositories;
using StudySphere.Services;

namespace StudySphere.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly IStudentRepository _studentRepository;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthenticationService authService, IStudentRepository studentRepository, ILogger<AuthController> logger)
    {
        _authService = authService;
        _studentRepository = studentRepository;
        _logger = logger;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.UserType?.ToLower() == "admin")
            return StatusCode(403, new { success = false, message = "Admin accounts cannot be created through self-registration." });

        var (success, message) = await _authService.SendOtpAsync(request.Email, request.Name, request.UserType);

        if (success)
        {
            return Ok(new { success = true, message });
        }

        return BadRequest(new { success = false, message });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _authService.VerifyOtpAsync(request.Email, request.Otp, request.UserType);

        if (success)
        {
            return Ok(new { success = true, message });
        }

        return BadRequest(new { success = false, message });
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.UserType?.ToLower() == "admin")
            return StatusCode(403, new { success = false, message = "Admin accounts cannot be created through self-registration." });

        var (success, message, token, userId, userType) = await _authService.SignupAsync(
            request.Email,
            request.Password,
            request.Name,
            request.UserType,
            request.EnrollmentNumber ?? string.Empty,
            request.Phone ?? string.Empty,
            request.Department ?? string.Empty,
            request.Semester ?? string.Empty
        );

        if (success)
        {
            return Ok(new
            {
                success = true,
                message,
                token,
                userId,
                userType,
                name = request.Name,
                email = request.Email,
                enrollmentNumber = request.EnrollmentNumber,
                phone = request.Phone,
                department = request.Department,
                semester = request.Semester,
                redirectUrl = userType == "student" ? "/dashboard" : "/admin-dashboard"
            });
        }

        return BadRequest(new { success = false, message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, token, userId, userType) = await _authService.LoginAsync(
            request.Email,
            request.Password,
            request.UserType
        );

        if (success)
        {
            string? name = null;
            string? enrollmentNumber = null;
            string? phone = null;
            string? department = null;
            string? semester = null;
            if (userType == "student")
            {
                var student = await _studentRepository.GetByEmailAsync(request.Email);
                name = student?.Name;
                enrollmentNumber = student?.EnrollmentNumber;
                phone = student?.Phone;
                department = student?.Department;
                semester = student?.Semester;
            }

            return Ok(new
            {
                success = true,
                message,
                token,
                userId,
                userType,
                name,
                email = request.Email,
                enrollmentNumber,
                phone,
                department,
                semester,
                redirectUrl = userType == "student" ? "/dashboard" : "/admin-dashboard"
            });
        }

        return BadRequest(new { success = false, message });
    }

    [HttpDelete("account")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { success = false, message = "Invalid token." });

        try
        {
            var student = await _studentRepository.GetByIdAsync(userId);
            if (student == null)
                return NotFound(new { success = false, message = "Account not found." });

            await _studentRepository.DeleteAsync(userId);
            _logger.LogInformation("Student {UserId} deleted their account.", userId);
            return Ok(new { success = true, message = "Account deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting account for student {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Failed to delete account." });
        }
    }

    // Lab 8 DML — step 1: send reset OTP
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (success, message) = await _authService.ForgotPasswordAsync(request.Email, request.UserType);
        if (success) return Ok(new { success = true, message });
        return BadRequest(new { success = false, message });
    }

    // Lab 8 DML — step 2: verify OTP + update password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (success, message) = await _authService.ResetPasswordAsync(
            request.Email, request.UserType, request.Otp, request.NewPassword);

        if (success) return Ok(new { success = true, message });
        return BadRequest(new { success = false, message });
    }
}

// DTOs for Auth Controller
public class SendOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty; // "student" or "admin"
}

public class VerifyOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
}

public class SignupRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty; // "student" or "admin"
    public string? EnrollmentNumber { get; set; }
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public string? Semester { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty; // "student" or "admin"
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
