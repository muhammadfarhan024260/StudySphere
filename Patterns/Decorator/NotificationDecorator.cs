using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Abstract decorator — wraps any INotificationDelivery and delegates to it
/// before (or after) adding its own behaviour.
/// </summary>
public abstract class NotificationDecorator : INotificationDelivery
{
    protected readonly INotificationDelivery _inner;

    protected NotificationDecorator(INotificationDelivery inner)
    {
        _inner = inner;
    }

    public virtual Task DeliverAsync(Notification notification, Student student)
        => _inner.DeliverAsync(notification, student);
}
