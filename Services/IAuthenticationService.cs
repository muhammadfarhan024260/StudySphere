using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StudySphere.Data;
using StudySphere.Models;

namespace StudySphere.Services;

public interface IAuthenticationService
{
    Task<(bool Success, string Message, string? Token, int? UserId, string? UserType)> SignupAsync(
        string email, string password, string name, string userType, string? enrollmentNumber = null);
    Task<(bool Success, string Message, string? Token, int? UserId, string? UserType)> LoginAsync(
        string email, string password, string userType);
    Task<(bool Success, string Message)> SendOtpAsync(string email, string name, string userType);
    Task<(bool Success, string Message)> VerifyOtpAsync(string email, string otp, string userType);
    string GenerateToken(int userId, string userType, string email);
    bool VerifyPassword(string password, string hash);
    string HashPassword(string password);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly Repositories.IStudentRepository _studentRepository;
    private readonly Repositories.IAdminRepository _adminRepository;
    private readonly IOtpService _otpService;
    private readonly StudySphereDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        Repositories.IStudentRepository studentRepository,
        Repositories.IAdminRepository adminRepository,
        IOtpService otpService,
        StudySphereDbContext context,
        IConfiguration configuration,
        ILogger<AuthenticationService> logger)
    {
        _studentRepository = studentRepository;
        _adminRepository = adminRepository;
        _otpService = otpService;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, string? Token, int? UserId, string? UserType)> SignupAsync(
        string email, string password, string name, string userType, string? enrollmentNumber = null)
    {
        try
        {
            userType = userType.ToLower();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(name))
            {
                return (false, "Email, password, and name are required", null, null, null);
            }

            if (password.Length < 6)
            {
                return (false, "Password must be at least 6 characters", null, null, null);
            }

            // Check if user already exists
            if (userType == "student")
            {
                if (await _studentRepository.EmailExistsAsync(email))
                {
                    return (false, "Email already registered", null, null, null);
                }

                if (!string.IsNullOrWhiteSpace(enrollmentNumber) &&
                    await _studentRepository.EnrollmentNumberExistsAsync(enrollmentNumber))
                {
                    return (false, "Enrollment number already registered", null, null, null);
                }

                // Verify OTP before creating account
                var verifiedOtp = await _otpService.GetVerifiedOtpAsync(email, "student");
                if (verifiedOtp == null)
                {
                    return (false, "Please verify your email with OTP first", null, null, null);
                }

                Student? student = null;

                student = new Student
                {
                    Email = email,
                    PasswordHash = HashPassword(password),
                    Name = name,
                    EnrollmentNumber = enrollmentNumber,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Students.Add(student);

                verifiedOtp.IsUsed = true;
                verifiedOtp.VerificationDate ??= DateTime.UtcNow;
                _context.OtpVerifications.Update(verifiedOtp);

                await _context.SaveChangesAsync();

                if (student == null)
                {
                    return (false, "Signup failed", null, null, null);
                }

                var token = GenerateToken(student.StudentId, "student", email);
                _logger.LogInformation("Student account created successfully for {Email}", email);

                return (true, "Account created successfully", token, student.StudentId, "student");
            }
            else if (userType == "admin")
            {
                if (await _adminRepository.EmailExistsAsync(email))
                {
                    return (false, "Email already registered", null, null, null);
                }

                // Verify OTP before creating account
                var verifiedOtp = await _otpService.GetVerifiedOtpAsync(email, "admin");
                if (verifiedOtp == null)
                {
                    return (false, "Please verify your email with OTP first", null, null, null);
                }

                Admin? admin = null;

                admin = new Admin
                {
                    Email = email,
                    PasswordHash = HashPassword(password),
                    Name = name,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Admins.Add(admin);

                verifiedOtp.IsUsed = true;
                verifiedOtp.VerificationDate ??= DateTime.UtcNow;
                _context.OtpVerifications.Update(verifiedOtp);

                await _context.SaveChangesAsync();

                if (admin == null)
                {
                    return (false, "Signup failed", null, null, null);
                }

                var token = GenerateToken(admin.AdminId, "admin", email);
                _logger.LogInformation("Admin account created successfully for {Email}", email);

                return (true, "Account created successfully", token, admin.AdminId, "admin");
            }

            return (false, "Invalid user type", null, null, null);
        }
        catch (Exception ex)
        {
            if (ex is Microsoft.EntityFrameworkCore.DbUpdateException dbUpdateException && dbUpdateException.InnerException != null)
            {
                _logger.LogError(dbUpdateException, "Database update failed during signup for {Email}: {Message}", email, dbUpdateException.InnerException.Message);
                return (false, $"Signup failed: {dbUpdateException.InnerException.Message}", null, null, null);
            }

            _logger.LogError(ex, "Error during signup for {Email}", email);
            return (false, $"Signup failed: {ex.Message}", null, null, null);
        }
    }

    public async Task<(bool Success, string Message, string? Token, int? UserId, string? UserType)> LoginAsync(
        string email, string password, string userType)
    {
        try
        {
            userType = userType.ToLower();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                return (false, "Email and password are required", null, null, null);
            }

            if (userType == "student")
            {
                var student = await _studentRepository.GetByEmailAsync(email);

                if (student == null || !VerifyPassword(password, student.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for student {Email}", email);
                    return (false, "Invalid email or password", null, null, null);
                }

                if (!student.IsActive)
                {
                    return (false, "Account is inactive", null, null, null);
                }

                // Update last login
                student.LastLogin = DateTime.UtcNow;
                await _studentRepository.UpdateAsync(student);

                var token = GenerateToken(student.StudentId, "student", email);
                _logger.LogInformation("Student {Email} logged in successfully", email);

                return (true, "Login successful", token, student.StudentId, "student");
            }
            else if (userType == "admin")
            {
                var admin = await _adminRepository.GetByEmailAsync(email);

                if (admin == null || !VerifyPassword(password, admin.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for admin {Email}", email);
                    return (false, "Invalid email or password", null, null, null);
                }

                if (!admin.IsActive)
                {
                    return (false, "Account is inactive", null, null, null);
                }

                // Update last login
                admin.LastLogin = DateTime.UtcNow;
                await _adminRepository.UpdateAsync(admin);

                var token = GenerateToken(admin.AdminId, "admin", email);
                _logger.LogInformation("Admin {Email} logged in successfully", email);

                return (true, "Login successful", token, admin.AdminId, "admin");
            }

            return (false, "Invalid user type", null, null, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", email);
            return (false, $"Login failed: {ex.Message}", null, null, null);
        }
    }

    public async Task<(bool Success, string Message)> SendOtpAsync(string email, string name, string userType)
    {
        try
        {
            userType = userType.ToLower();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(name))
            {
                return (false, "Email and name are required");
            }

            await _otpService.GenerateAndSendOtpAsync(email, userType, name);
            return (true, "OTP sent to your email successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP to {Email}", email);
            return (false, $"Failed to send OTP: {ex.Message}");
        }
    }

    public async Task<(bool Success, string Message)> VerifyOtpAsync(string email, string otp, string userType)
    {
        try
        {
            userType = userType.ToLower();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
            {
                return (false, "Email and OTP are required");
            }

            var result = await _otpService.VerifyOtpAsync(email, otp, userType);
            if (result)
            {
                _logger.LogInformation("OTP verified successfully for {Email}", email);
                return (true, "OTP verified successfully");
            }

            return (false, "Invalid or expired OTP");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for {Email}", email);
            return (false, $"OTP verification failed: {ex.Message}");
        }
    }

    public string GenerateToken(int userId, string userType, string email)
    {
        var jwtSecret = _configuration["JWT:Secret"];
        var jwtIssuer = _configuration["JWT:Issuer"];
        var jwtAudience = _configuration["JWT:Audience"];

        if (string.IsNullOrEmpty(jwtSecret))
        {
            throw new InvalidOperationException("JWT Secret is not configured");
        }

        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim("userType", userType),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
