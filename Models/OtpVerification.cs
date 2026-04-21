namespace StudySphere.Models;

public class OtpVerification
{
    public int OtpId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty; // "student" or "admin"
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime ExpiryTime { get; set; }
    public DateTime? VerificationDate { get; set; }
    public int AttemptCount { get; set; } = 0;
    public bool IsUsed { get; set; } = false;
}
