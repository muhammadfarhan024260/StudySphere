using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Decorator that adds SMS delivery. Integration point for Twilio / Vonage.
/// Stubbed for demo — logs to console.
/// </summary>
public class SmsNotificationDecorator : NotificationDecorator
{
    public SmsNotificationDecorator(INotificationDelivery inner) : base(inner) { }

    public override async Task DeliverAsync(Notification notification)
    {
        await base.DeliverAsync(notification);

        // Stub: real implementation would call Twilio/Vonage SMS API here
        var preview = notification.Message.Length > 80
            ? notification.Message[..80] + "..."
            : notification.Message;
        Console.WriteLine($"[SMS Decorator] SMS queued for student #{notification.StudentId}: {preview}");
    }
}
