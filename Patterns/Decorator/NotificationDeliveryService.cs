using StudySphere.Repositories;
using StudySphere.Services;

namespace StudySphere.Patterns.Decorator;

/// <summary>
/// Builds the decorator chain at runtime based on which delivery channels are requested.
/// Registered as scoped in DI so it can hold scoped dependencies.
/// </summary>
public class NotificationDeliveryService
{
    private readonly IEmailService _emailService;
    private readonly IStudentRepository _studentRepository;

    public NotificationDeliveryService(IEmailService emailService, IStudentRepository studentRepository)
    {
        _emailService = emailService;
        _studentRepository = studentRepository;
    }

    /// <summary>
    /// Constructs the decorator chain: Base → Email? → SMS? → Push?
    /// Each layer adds a delivery channel without modifying the others.
    /// </summary>
    public INotificationDelivery BuildChain(bool withEmail = true, bool withSms = false, bool withPush = false)
    {
        INotificationDelivery chain = new BaseNotificationDelivery();

        if (withEmail) chain = new EmailNotificationDecorator(chain, _emailService, _studentRepository);
        if (withSms)   chain = new SmsNotificationDecorator(chain);
        if (withPush)  chain = new PushNotificationDecorator(chain);

        return chain;
    }
}
