using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Concrete base component. The notification is already persisted to the DB by the
/// IntelligenceService — this base step confirms in-app delivery is complete.
/// </summary>
public class BaseNotificationDelivery : INotificationDelivery
{
    public Task DeliverAsync(Notification notification)
    {
        // In-app delivery: notification is visible in the student's notification tab.
        Console.WriteLine($"[Base] In-app notification #{notification.NotificationId} ready for student #{notification.StudentId}.");
        return Task.CompletedTask;
    }
}
