using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace StudySphere.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string otp, string userName);
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _http;

    private const string FromAddress = "StudySphere <onboarding@resend.dev>";
    private const string ResendEndpoint = "https://api.resend.com/emails";

    public EmailService(IConfiguration config, ILogger<EmailService> logger, IHttpClientFactory httpFactory)
    {
        _config = config;
        _logger = logger;
        _http = httpFactory.CreateClient("resend");
    }

    public Task SendOtpEmailAsync(string email, string otp, string userName)
    {
        var subject = "Your StudySphere verification code";
        var html = $@"
<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1""></head>
<body style=""margin:0;padding:0;background:#f7f7f7;font-family:'Segoe UI',Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f7f7f7;padding:40px 16px;"">
    <tr><td align=""center"">
      <table width=""100%"" style=""max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">

        <!-- Header -->
        <tr>
          <td style=""background:#58cc02;padding:32px 40px;text-align:center;"">
            <div style=""font-size:28px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;"">StudySphere</div>
            <div style=""font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;letter-spacing:1px;"">ACADEMIC MANAGEMENT PLATFORM</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style=""padding:40px 40px 32px;"">
            <p style=""margin:0 0 8px;font-size:22px;font-weight:800;color:#100f3e;"">Hi {userName}</p>
            <p style=""margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;"">
              Use the verification code below to complete your sign-up. It expires in <strong>10 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:28px;"">
              <tr>
                <td align=""center"" style=""background:#f0fde4;border:2px dashed #58cc02;border-radius:12px;padding:24px;"">
                  <div style=""font-size:42px;font-weight:900;letter-spacing:12px;color:#58cc02;font-family:'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif; text-transform: uppercase; text-align: center;"">{otp}</div>
                </td>
              </tr>
            </table>

            <p style=""margin:0;font-size:13px;color:#999;line-height:1.6;"">
              If you didn't request this code, you can safely ignore this email — your account won't be created.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style=""background:#f7f7f7;padding:20px 40px;text-align:center;border-top:1px solid #eee;"">
            <p style=""margin:0;font-size:12px;color:#aaa;letter-spacing:0.5px;"">© 2026 StudySphere · Bahria University</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";

        return SendEmailAsync(email, subject, html);
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _config["Resend:ApiKey"]
                     ?? Environment.GetEnvironmentVariable("Resend__ApiKey");

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("[Resend] API key missing — email to {Email} not sent.", to);
            return;
        }

        // Wrap plain-text body in branded layout if it isn't already HTML
        var html = body.TrimStart().StartsWith('<') ? body : WrapInBrandedLayout(body);

        var payload = JsonSerializer.Serialize(new
        {
            from    = FromAddress,
            to      = new[] { to },
            subject,
            html
        });

        var req = new HttpRequestMessage(HttpMethod.Post, ResendEndpoint)
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var res = await _http.SendAsync(req);
        if (res.IsSuccessStatusCode)
            _logger.LogInformation("[Resend] Email sent to {Email}.", to);
        else
        {
            var err = await res.Content.ReadAsStringAsync();
            _logger.LogError("[Resend] Failed to send to {Email}: {Status} — {Body}", to, res.StatusCode, err);
            throw new Exception($"Resend API error {res.StatusCode}: {err}");
        }
    }

    private static string WrapInBrandedLayout(string message) => $@"
<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1""></head>
<body style=""margin:0;padding:0;background:#f7f7f7;font-family:'Segoe UI',Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f7f7f7;padding:40px 16px;"">
    <tr><td align=""center"">
      <table width=""100%"" style=""max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">

        <tr>
          <td style=""background:#58cc02;padding:28px 40px;text-align:center;"">
            <div style=""font-size:26px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;"">StudySphere</div>
            <div style=""font-size:12px;color:rgba(255,255,255,0.85);margin-top:4px;letter-spacing:1px;"">ACADEMIC MANAGEMENT PLATFORM</div>
          </td>
        </tr>

        <tr>
          <td style=""padding:36px 40px;"">
            <p style=""margin:0;font-size:15px;color:#444;line-height:1.7;white-space:pre-wrap;"">{message}</p>
          </td>
        </tr>

        <tr>
          <td style=""background:#f7f7f7;padding:18px 40px;text-align:center;border-top:1px solid #eee;"">
            <p style=""margin:0;font-size:12px;color:#aaa;"">© 2026 StudySphere · Bahria University</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";
}
