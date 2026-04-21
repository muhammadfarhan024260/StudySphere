using StudySphere.Models;

namespace StudySphere.Services;

public interface IOtpService
{
    Task<string> GenerateAndSendOtpAsync(string email, string userType, string userName);
    Task<bool> VerifyOtpAsync(string email, string otp, string userType);
    Task<OtpVerification?> GetVerifiedOtpAsync(string email, string userType);
    Task<bool> MarkOtpAsUsedAsync(string email, string userType);
}

public class OtpService : IOtpService
{
    private readonly Repositories.IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<OtpService> _logger;
    private const int OTP_LENGTH = 6;
    private const int OTP_EXPIRY_MINUTES = 15;
    private const int MAX_ATTEMPTS = 5;

    public OtpService(
        Repositories.IOtpRepository otpRepository,
        IEmailService emailService,
        ILogger<OtpService> logger)
    {
        _otpRepository = otpRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<string> GenerateAndSendOtpAsync(string email, string userType, string userName)
    {
        try
        {
            // Generate 6-digit OTP
            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            var otpVerification = new OtpVerification
            {
                Email = email,
                OtpCode = otp,
                UserType = userType.ToLower(),
                CreatedDate = DateTime.UtcNow,
                ExpiryTime = DateTime.UtcNow.AddMinutes(OTP_EXPIRY_MINUTES),
                IsVerified = false,
                IsUsed = false,
                AttemptCount = 0
            };

            await _otpRepository.CreateAsync(otpVerification);

            // Send OTP via email
            await _emailService.SendOtpEmailAsync(email, otp, userName);

            _logger.LogInformation("OTP generated and sent to {Email} for user type {UserType}", email, userType);
            return otp;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating and sending OTP to {Email}", email);
            throw;
        }
    }

    public async Task<bool> VerifyOtpAsync(string email, string otp, string userType)
    {
        try
        {
            var otpRecord = await _otpRepository.GetLatestUnusedOtpAsync(email, userType.ToLower());

            if (otpRecord == null)
            {
                _logger.LogWarning("No valid OTP found for {Email}", email);
                return false;
            }

            if (otpRecord.AttemptCount >= MAX_ATTEMPTS)
            {
                _logger.LogWarning("Max OTP attempts exceeded for {Email}", email);
                return false;
            }

            if (DateTime.UtcNow > otpRecord.ExpiryTime)
            {
                _logger.LogWarning("OTP expired for {Email}", email);
                return false;
            }

            return await _otpRepository.VerifyOtpAsync(email, otp, userType.ToLower());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for {Email}", email);
            throw;
        }
    }

    public async Task<OtpVerification?> GetVerifiedOtpAsync(string email, string userType)
    {
        return await _otpRepository.GetByEmailAndUserTypeAsync(email, userType.ToLower());
    }

    public async Task<bool> MarkOtpAsUsedAsync(string email, string userType)
    {
        return await _otpRepository.MarkLatestVerifiedOtpAsUsedAsync(email, userType.ToLower());
    }
}
