using Microsoft.EntityFrameworkCore;
using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IOtpRepository
{
    Task<OtpVerification?> GetLatestUnusedOtpAsync(string email, string userType);
    Task<OtpVerification> CreateAsync(OtpVerification otp);
    Task<bool> VerifyOtpAsync(string email, string otpCode, string userType);
    Task<OtpVerification?> GetByEmailAndUserTypeAsync(string email, string userType);
    Task<bool> MarkLatestVerifiedOtpAsUsedAsync(string email, string userType);
    Task UpdateAsync(OtpVerification otp);
}

public class OtpRepository : IOtpRepository
{
    private readonly StudySphere.Data.StudySphereDbContext _context;

    public OtpRepository(StudySphere.Data.StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<OtpVerification?> GetLatestUnusedOtpAsync(string email, string userType)
    {
        var otp = await _context.OtpVerifications
            .Where(o => o.Email == email && 
                       o.UserType == userType && 
                       !o.IsUsed)
            .OrderByDescending(o => o.CreatedDate)
            .FirstOrDefaultAsync();

        if (otp == null)
        {
            return null;
        }

        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        return otp.ExpiryTime > currentTime ? otp : null;
    }

    public async Task<OtpVerification> CreateAsync(OtpVerification otp)
    {
        NormalizeOtpDateTimes(otp);

        var activeOtps = await _context.OtpVerifications
            .Where(o => o.Email == otp.Email &&
                       o.UserType == otp.UserType &&
                       !o.IsUsed)
            .ToListAsync();

        if (activeOtps.Count > 0)
        {
            _context.OtpVerifications.RemoveRange(activeOtps);
            await _context.SaveChangesAsync();
        }

        _context.OtpVerifications.Add(otp);
        await _context.SaveChangesAsync();
        return otp;
    }

    public async Task<bool> VerifyOtpAsync(string email, string otpCode, string userType)
    {
        var otp = await GetLatestUnusedOtpAsync(email, userType);
        
        if (otp == null || otp.OtpCode != otpCode)
        {
            if (otp != null)
            {
                otp.AttemptCount++;
                await UpdateAsync(otp);
            }
            return false;
        }

        otp.IsVerified = true;
        otp.VerificationDate = DateTime.UtcNow;
        await UpdateAsync(otp);
        return true;
    }

    public async Task<OtpVerification?> GetByEmailAndUserTypeAsync(string email, string userType)
    {
        return await _context.OtpVerifications
            .Where(o => o.Email == email &&
                        o.UserType == userType &&
                        o.IsVerified &&
                        !o.IsUsed)
            .OrderByDescending(o => o.VerificationDate)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> MarkLatestVerifiedOtpAsUsedAsync(string email, string userType)
    {
        var otp = await GetByEmailAndUserTypeAsync(email, userType);

        if (otp == null)
        {
            return false;
        }

        otp.IsUsed = true;
        await UpdateAsync(otp);
        return true;
    }

    public async Task UpdateAsync(OtpVerification otp)
    {
        NormalizeOtpDateTimes(otp);

        _context.OtpVerifications.Update(otp);
        await _context.SaveChangesAsync();
    }

    private static void NormalizeOtpDateTimes(OtpVerification otp)
    {
        otp.CreatedDate = EnsureUnspecified(otp.CreatedDate);
        otp.ExpiryTime = EnsureUnspecified(otp.ExpiryTime);

        if (otp.VerificationDate.HasValue)
        {
            otp.VerificationDate = EnsureUnspecified(otp.VerificationDate.Value);
        }
    }

    private static DateTime EnsureUnspecified(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Unspecified => value,
            DateTimeKind.Local => DateTime.SpecifyKind(value, DateTimeKind.Unspecified),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Unspecified)
        };
    }
}
