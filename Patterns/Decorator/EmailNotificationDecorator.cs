using StudySphere.Models;
using StudySphere.Services;

namespace StudySphere.Patterns.Decorator;

public class EmailNotificationDecorator : NotificationDecorator
{
    private readonly IEmailService _emailService;

    public EmailNotificationDecorator(INotificationDelivery inner, IEmailService emailService) : base(inner)
    {
        _emailService = emailService;
    }

    public override async Task DeliverAsync(Notification notification, Student student)
    {
        await base.DeliverAsync(notification, student);

        await _emailService.SendEmailAsync(
            student.Email,
            "StudySphere — New Notification",
            $"<p>Hi {student.Name},</p><p>{notification.Message}</p><p><em>StudySphere</em></p>"
        );
        Console.WriteLine($"[Email Decorator] Email sent to {student.Email}");
    }
}
