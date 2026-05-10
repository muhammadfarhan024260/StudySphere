using System.Text;
using System.Text.Json;
using StudySphere.Models;

namespace StudySphere.Patterns.Decorator;

public class SmsNotificationDecorator : NotificationDecorator
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http;

    private const string GraphApiVersion = "v19.0";

    public SmsNotificationDecorator(INotificationDelivery inner, IConfiguration config, IHttpClientFactory httpFactory)
        : base(inner)
    {
        _config = config;
        _http   = httpFactory.CreateClient("meta-whatsapp");
    }

    public override async Task DeliverAsync(Notification notification, Student student)
    {
        await base.DeliverAsync(notification, student);

        if (string.IsNullOrWhiteSpace(student.Phone))
        {
            Console.WriteLine($"[WhatsApp Decorator] Skipped student #{student.StudentId} — no phone number.");
            return;
        }

        var token       = _config["Meta:WhatsAppToken"];
        var phoneNumId  = _config["Meta:PhoneNumberId"];

        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(phoneNumId))
        {
            Console.WriteLine("[WhatsApp Decorator] Meta credentials missing — skipped.");
            return;
        }

        try
        {
            // Convert +92-300-1234567 → 923001234567 (E.164 digits only)
            var to = student.Phone.Replace("-", "").Replace("+", "").Trim();

            var payload = JsonSerializer.Serialize(new
            {
                messaging_product = "whatsapp",
                recipient_type    = "individual",
                to,
                type = "text",
                text = new { body = notification.Message }
            });

            var req = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://graph.facebook.com/{GraphApiVersion}/{phoneNumId}/messages")
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json")
            };
            req.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var res = await _http.SendAsync(req);

            if (res.IsSuccessStatusCode)
                Console.WriteLine($"[WhatsApp Decorator] Message sent to {student.Phone}");
            else
            {
                var err = await res.Content.ReadAsStringAsync();
                Console.WriteLine($"[WhatsApp Decorator] Failed for student #{student.StudentId}: {res.StatusCode} — {err}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WhatsApp Decorator] Exception for student #{student.StudentId}: {ex.Message}");
        }
    }
}
