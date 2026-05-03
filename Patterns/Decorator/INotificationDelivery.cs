using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Decorator Pattern — component interface for notification delivery channels.
/// </summary>
public interface INotificationDelivery
{
    Task DeliverAsync(Notification notification);
}
