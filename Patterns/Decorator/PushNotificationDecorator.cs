using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Decorator that adds push notification delivery. Integration point for Firebase FCM / APNs.
/// Stubbed for demo — logs to console.
/// </summary>
public class PushNotificationDecorator : NotificationDecorator
{
    public PushNotificationDecorator(INotificationDelivery inner) : base(inner) { }

    public override async Task DeliverAsync(Notification notification)
    {
        await base.DeliverAsync(notification);

        // Stub: real implementation would call Firebase Cloud Messaging here
        Console.WriteLine($"[Push Decorator] Push notification queued for student #{notification.StudentId}");
    }
}
