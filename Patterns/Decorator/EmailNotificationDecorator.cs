using StudySphere.Models;
using StudySphere.Repositories;
using StudySphere.Services;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Decorator that adds email delivery on top of whatever the inner chain does.
/// </summary>
public class EmailNotificationDecorator : NotificationDecorator
{
    private readonly IEmailService _emailService;
    private readonly IStudentRepository _studentRepository;

    public EmailNotificationDecorator(
        INotificationDelivery inner,
        IEmailService emailService,
        IStudentRepository studentRepository) : base(inner)
    {
        _emailService = emailService;
        _studentRepository = studentRepository;
    }

    public override async Task DeliverAsync(Notification notification)
    {
        await base.DeliverAsync(notification);

        var student = await _studentRepository.GetByIdAsync(notification.StudentId);
        if (student is not null)
        {
            await _emailService.SendEmailAsync(
                student.Email,
                "StudySphere — New Notification",
                $"<p>Hi {student.Name},</p><p>{notification.Message}</p><p><em>StudySphere</em></p>"
            );
            Console.WriteLine($"[Email Decorator] Email sent to {student.Email}");
        }
    }
}
