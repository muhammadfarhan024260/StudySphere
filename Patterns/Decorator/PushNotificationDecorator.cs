using FirebaseAdmin.Messaging;
using StudySphere.Models;
using FcmMessage = FirebaseAdmin.Messaging.Message;
using FcmNotification = FirebaseAdmin.Messaging.Notification;

namespace StudySphere.Patterns.Decorator;

public class PushNotificationDecorator : NotificationDecorator
{
    public PushNotificationDecorator(INotificationDelivery inner) : base(inner) { }

    public override async Task DeliverAsync(Models.Notification notification, Student student)
    {
        await base.DeliverAsync(notification, student);

        if (string.IsNullOrWhiteSpace(student.FcmToken))
        {
            Console.WriteLine($"[Push Decorator] Skipped student #{student.StudentId} — no FCM token.");
            return;
        }

        try
        {
            var message = new FcmMessage
            {
                Token = student.FcmToken,
                Notification = new FcmNotification
                {
                    Title = "StudySphere",
                    Body = notification.Message
                }
            };
            await FirebaseMessaging.DefaultInstance.SendAsync(message);
            Console.WriteLine($"[Push Decorator] Push sent to student #{student.StudentId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Push Decorator] Failed for student #{student.StudentId}: {ex.Message}");
        }
    }
}
