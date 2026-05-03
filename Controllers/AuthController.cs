using Microsoft.AspNetCore.Mvc;
using StudySphere.Services;

namespace StudySphere.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthenticationService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

        var (success, message, token, userId, userType) = await _authService.SignupAsync(
            request.Email,
            request.Password,
            request.Name,
            request.UserType,
            request.EnrollmentNumber
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
            return Ok(new
            {
                success = true,
                message,
                token,
                userId,
                userType,
                redirectUrl = userType == "student" ? "/dashboard" : "/admin-dashboard"
            });
        }

        return BadRequest(new { success = false, message });
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
