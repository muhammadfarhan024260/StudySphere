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

    private const string FromAddress    = "StudySphere <noreply@study-sphere.app>";
    private const string ResendEndpoint = "https://api.resend.com/emails";

    // GitHub raw URL — publicly accessible from Resend servers and any email client
    private const string IconUrl =
        "https://raw.githubusercontent.com/muhammadfarhan024260/StudySphere/main/Frontend/public/icon.png";

    // Colours — kept as constants so both templates stay visually consistent
    private const string ColDark    = "#0d0c2b";   // deep navy
    private const string ColGreen   = "#58cc02";   // brand green
    private const string ColGreenDim = "#3fa300";  // darker green for shadows
    private const string ColBg      = "#f4f6f9";
    private const string ColCard    = "#ffffff";
    private const string ColText1   = "#0d0c2b";
    private const string ColText2   = "#4a5568";
    private const string ColText3   = "#9aa5b4";
    private const string ColBorder  = "#e8ecf0";

    public EmailService(IConfiguration config, ILogger<EmailService> logger, IHttpClientFactory httpFactory)
    {
        _config = config;
        _logger = logger;
        _http   = httpFactory.CreateClient("resend");
    }

    // ── OTP email ──────────────────────────────────────────────────────────
    public Task SendOtpEmailAsync(string email, string otp, string userName)
    {
        var html = $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
  <meta name=""color-scheme"" content=""light"">
  <title>Your StudySphere verification code</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
  </style>
</head>
<body style=""margin:0;padding:0;background:{ColBg};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;"">
<table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation"" style=""background:{ColBg};padding:40px 16px;"">
<tr><td align=""center"">

  <!-- Card -->
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
         style=""max-width:520px;background:{ColCard};border-radius:20px;overflow:hidden;
                box-shadow:0 8px 40px rgba(13,12,43,0.12),0 2px 8px rgba(13,12,43,0.06);"">

    <!-- ── Header ── -->
    <tr>
      <td style=""background:{ColDark};padding:0;"">
        <!-- Green accent stripe -->
        <div style=""height:4px;background:linear-gradient(90deg,{ColGreen},{ColGreenDim});""></div>
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
               style=""padding:32px 40px 28px;"">
          <tr>
            <td align=""center"">
              <!-- Logo mark -->
              <img src=""{IconUrl}"" alt=""StudySphere"" width=""56"" height=""56""
                   style=""display:block;margin:0 auto 16px;border-radius:14px;
                          border:2px solid rgba(88,204,2,0.3);"">
              <div style=""font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:22px;font-weight:900;color:#ffffff;
                           letter-spacing:2px;text-transform:uppercase;
                           line-height:1;"">StudySphere</div>
              <div style=""margin-top:6px;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);
                           letter-spacing:3px;text-transform:uppercase;"">BAHRIA UNIVERSITY</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── Body ── -->
    <tr>
      <td style=""padding:40px 40px 32px;"">

        <!-- Greeting -->
        <p style=""margin:0 0 6px;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:24px;font-weight:900;color:{ColText1};line-height:1.2;"">
          Hi {userName} 👋
        </p>
        <p style=""margin:0 0 28px;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:15px;font-weight:600;color:{ColText2};line-height:1.65;"">
          Here's your one-time verification code. It expires in <strong style=""color:{ColText1};"">10 minutes</strong>.
        </p>

        <!-- OTP block -->
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
               style=""margin-bottom:28px;"">
          <tr>
            <td align=""center""
                style=""background:linear-gradient(135deg,#f0fde4 0%,#e8f9d4 100%);
                        border:2px solid {ColGreen};border-radius:14px;padding:28px 20px;"">
              <div style=""font-family:'Nunito','Courier New',monospace;
                           font-size:46px;font-weight:900;letter-spacing:14px;
                           color:{ColGreen};line-height:1;
                           text-shadow:0 2px 0 rgba(63,163,0,0.25);"">
                {otp}
              </div>
              <div style=""margin-top:12px;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:12px;font-weight:700;color:{ColGreenDim};
                           letter-spacing:1.5px;text-transform:uppercase;"">
                Verification Code
              </div>
            </td>
          </tr>
        </table>

        <!-- Warning -->
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
               style=""margin-bottom:8px;"">
          <tr>
            <td style=""background:#fff8f0;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;
                        padding:12px 16px;"">
              <p style=""margin:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                         font-size:13px;font-weight:600;color:#92400e;line-height:1.5;"">
                ⚠️ If you didn't request this code, you can safely ignore this email.
                Your account won't be created.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- ── Footer ── -->
    <tr>
      <td style=""background:{ColBg};border-top:1px solid {ColBorder};padding:20px 40px;text-align:center;"">
        <p style=""margin:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:12px;font-weight:600;color:{ColText3};letter-spacing:0.5px;"">
          © 2026 StudySphere · Bahria University Academic Management
        </p>
        <p style=""margin:6px 0 0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:11px;color:{ColText3};"">
          This is an automated message — please do not reply.
        </p>
      </td>
    </tr>

  </table>
  <!-- /Card -->

</td></tr>
</table>
</body>
</html>";

        return SendEmailAsync(email, "Your StudySphere verification code", html);
    }

    // ── Broadcast / generic email ──────────────────────────────────────────
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _config["Resend:ApiKey"]
                     ?? Environment.GetEnvironmentVariable("Resend__ApiKey");

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("[Resend] API key missing — email to {Email} not sent.", to);
            throw new InvalidOperationException("Resend API key is not configured. Set Resend__ApiKey in environment variables.");
        }

        var html = body.TrimStart().StartsWith('<') ? body : BroadcastTemplate(subject, body);

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
            _logger.LogError("[Resend] Failed {Email}: {Status} — {Body}", to, res.StatusCode, err);
            throw new Exception($"Resend API error {res.StatusCode}: {err}");
        }
    }

    // ── Broadcast template ─────────────────────────────────────────────────
    private string BroadcastTemplate(string subject, string message)
    {
        var now = DateTime.UtcNow.ToString("MMMM d, yyyy · HH:mm UTC");

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
  <meta name=""color-scheme"" content=""light"">
  <title>{subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
  </style>
</head>
<body style=""margin:0;padding:0;background:{ColBg};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;"">
<table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation"" style=""background:{ColBg};padding:40px 16px;"">
<tr><td align=""center"">

  <!-- Card -->
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
         style=""max-width:560px;background:{ColCard};border-radius:20px;overflow:hidden;
                box-shadow:0 8px 40px rgba(13,12,43,0.12),0 2px 8px rgba(13,12,43,0.06);"">

    <!-- ── Header ── -->
    <tr>
      <td style=""background:{ColDark};padding:0;"">
        <div style=""height:4px;background:linear-gradient(90deg,{ColGreen} 0%,#1cb0f6 100%);""></div>
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
               style=""padding:28px 40px 24px;"">
          <tr>
            <td valign=""middle"">
              <div style=""font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:20px;font-weight:900;color:#ffffff;
                           letter-spacing:1.5px;text-transform:uppercase;line-height:1;"">
                StudySphere
              </div>
              <div style=""margin-top:4px;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:10px;font-weight:700;color:rgba(255,255,255,0.4);
                           letter-spacing:2.5px;text-transform:uppercase;"">
                BAHRIA UNIVERSITY
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── Subject banner ── -->
    <tr>
      <td style=""background:#f8faff;border-bottom:1px solid {ColBorder};padding:18px 40px;"">
        <p style=""margin:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:18px;font-weight:900;color:{ColText1};line-height:1.3;"">
          {subject}
        </p>
        <p style=""margin:4px 0 0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:11px;font-weight:600;color:{ColText3};letter-spacing:0.5px;"">
          {now}
        </p>
      </td>
    </tr>

    <!-- ── Message body ── -->
    <tr>
      <td style=""padding:32px 40px;"">

        <!-- Message card -->
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation""
               style=""margin-bottom:24px;"">
          <tr>
            <td width=""4"" style=""background:linear-gradient(180deg,{ColGreen},{ColGreenDim});
                                    border-radius:4px;"">
            </td>
            <td style=""padding:18px 20px;background:#f9fbf6;
                        border:1px solid rgba(88,204,2,0.2);border-left:none;
                        border-radius:0 10px 10px 0;"">
              <p style=""margin:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                         font-size:15px;font-weight:600;color:{ColText1};
                         line-height:1.75;white-space:pre-wrap;"">
                {message}
              </p>
            </td>
          </tr>
        </table>

        <!-- From line -->
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" role=""presentation"">
          <tr>
            <td style=""padding:14px 18px;background:{ColBg};border-radius:10px;
                        border:1px solid {ColBorder};"">
              <div style=""font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:12px;font-weight:800;color:{ColText1};"">
                StudySphere Admin
              </div>
              <div style=""font-family:'Nunito','Segoe UI',Arial,sans-serif;
                           font-size:11px;font-weight:600;color:{ColText3};margin-top:2px;"">
                Sent to all active students
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- ── Footer ── -->
    <tr>
      <td style=""background:{ColDark};padding:20px 40px;text-align:center;"">
        <p style=""margin:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);
                   letter-spacing:0.5px;"">
          © 2026 StudySphere · Bahria University Academic Management
        </p>
        <p style=""margin:6px 0 0;font-family:'Nunito','Segoe UI',Arial,sans-serif;
                   font-size:11px;color:rgba(255,255,255,0.2);"">
          This is an automated broadcast — please do not reply to this email.
        </p>
      </td>
    </tr>

  </table>
  <!-- /Card -->

</td></tr>
</table>
</body>
</html>";
    }
}
