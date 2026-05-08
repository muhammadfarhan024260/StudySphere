using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

public interface INotificationDelivery
{
    Task DeliverAsync(Notification notification, Student student);
}
