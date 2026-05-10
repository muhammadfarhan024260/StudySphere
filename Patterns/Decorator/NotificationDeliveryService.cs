using Microsoft.Extensions.Configuration;
using StudySphere.Services;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Builds the decorator chain at runtime based on which delivery channels are requested.
/// Registered as scoped in DI so it can hold scoped dependencies.
/// </summary>
public class NotificationDeliveryService
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpFactory;

    public NotificationDeliveryService(IEmailService emailService, IConfiguration config, IHttpClientFactory httpFactory)
    {
        _emailService = emailService;
        _config       = config;
        _httpFactory  = httpFactory;
    }

    /// <summary>
    /// Constructs the decorator chain: Base → Email? → WhatsApp? → Push?
    /// </summary>
    public INotificationDelivery BuildChain(bool withEmail = true, bool withWhatsApp = false, bool withPush = false)
    {
        INotificationDelivery chain = new BaseNotificationDelivery();

        if (withEmail)    chain = new EmailNotificationDecorator(chain, _emailService);
        if (withWhatsApp) chain = new SmsNotificationDecorator(chain, _config, _httpFactory);
        if (withPush)     chain = new PushNotificationDecorator(chain);

        return chain;
    }
}
