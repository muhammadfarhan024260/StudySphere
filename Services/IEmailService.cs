using System.Net;
using System.Net.Mail;

namespace StudySphere.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string otp, string userName);
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string email, string otp, string userName)
    {
        var subject = "StudySphere - Email Verification Code";
        var body = $@"
            <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #333;'>Welcome to StudySphere, {userName}!</h2>
                    <p>Your email verification code is:</p>
                    <h1 style='color: #007bff; letter-spacing: 2px; font-size: 32px;'>{otp}</h1>
                    <p style='color: #666;'>This code will expire in 15 minutes.</p>
                    <p style='color: #666; font-size: 12px;'>If you didn't request this code, please ignore this email.</p>
                    <hr style='margin-top: 20px; border: none; border-top: 1px solid #ddd;'/>
                    <p style='color: #999; font-size: 12px;'>StudySphere - Academic Management Platform</p>
                </body>
            </html>";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["SMTP:Host"];
            var smtpPort = int.Parse(_configuration["SMTP:Port"] ?? "587");
            var smtpUsername = _configuration["SMTP:Username"];
            var smtpPassword = _configuration["SMTP:Password"];
            var senderEmail = _configuration["SMTP:SenderEmail"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername))
            {
                _logger.LogWarning("SMTP configuration is missing. Email not sent to {Email}", to);
                return;
            }

            using (var client = new SmtpClient(smtpHost, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail ?? smtpUsername),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {Email}", to);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}", to);
            throw;
        }
    }
}
