using FirebaseAdmin.Messaging;
using StudySphere.Models;
using FcmMessage = FirebaseAdmin.Messaging.Message;

namespace StudySphere.Patterns.Decorator;

public class PushNotificationDecorator : NotificationDecorator
{
    // GitHub raw URL — publicly accessible from any network, including FCM servers
    private const string IconUrl =
        "https://raw.githubusercontent.com/muhammadfarhan024260/StudySphere/main/Frontend/public/icon.png";

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
                Webpush = new WebpushConfig
                {
                    Notification = new WebpushNotification
                    {
                        Title = "StudySphere",
                        Body  = notification.Message,
                        Icon  = IconUrl,
                        Badge = IconUrl,
                    }
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
