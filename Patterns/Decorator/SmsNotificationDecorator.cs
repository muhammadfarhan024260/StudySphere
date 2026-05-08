using Microsoft.Extensions.Configuration;
using StudySphere.Models;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace StudySphere.Patterns.Decorator;

public class SmsNotificationDecorator : NotificationDecorator
{
    private readonly IConfiguration _config;

    public SmsNotificationDecorator(INotificationDelivery inner, IConfiguration config) : base(inner)
    {
        _config = config;
    }

    public override async Task DeliverAsync(Notification notification, Student student)
    {
        await base.DeliverAsync(notification, student);

        if (string.IsNullOrWhiteSpace(student.Phone))
        {
            Console.WriteLine($"[WhatsApp Decorator] Skipped student #{student.StudentId} — no phone number.");
            return;
        }

        try
        {
            // Convert +92-300-1234567 → whatsapp:+923001234567
            var digits = student.Phone.Replace("-", "");
            var toNumber = new PhoneNumber("whatsapp:" + digits);
            var fromNumber = new PhoneNumber("whatsapp:" + _config["Twilio:WhatsAppFrom"]);

            await MessageResource.CreateAsync(
                to: toNumber,
                from: fromNumber,
                body: $"StudySphere: {notification.Message}"
            );
            Console.WriteLine($"[WhatsApp Decorator] Message sent to {student.Phone}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WhatsApp Decorator] Failed for student #{student.StudentId}: {ex.Message}");
        }
    }
}
