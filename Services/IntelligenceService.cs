using StudySphere.Models;
using StudySphere.Repositories;

namespace StudySphere.Services;

public class IntelligenceService : IIntelligenceService
{
    private readonly IWeakAreaRepository _weakAreas;
    private readonly INotificationRepository _notifications;
    private readonly IRecommendationRepository _recommendations;

    public IntelligenceService(
        IWeakAreaRepository weakAreas,
        INotificationRepository notifications,
        IRecommendationRepository recommendations)
    {
        _weakAreas = weakAreas;
        _notifications = notifications;
        _recommendations = recommendations;
    }

    public Task<IEnumerable<WeakArea>> GetWeakSubjectsAsync(int studentId)
        => _weakAreas.GetByStudentIdAsync(studentId);

    public Task<IEnumerable<Notification>> GetNotificationsAsync(int studentId)
        => _notifications.GetByStudentIdAsync(studentId);

    public Task<bool> MarkNotificationReadAsync(int notificationId)
        => _notifications.MarkReadAsync(notificationId);

    public Task<IEnumerable<Recommendation>> GetRecommendationsForStudentAsync(int studentId)
        => _recommendations.GetForStudentAsync(studentId);

    public Task<IEnumerable<Recommendation>> GetAllRecommendationsAsync()
        => _recommendations.GetAllWithJoinsAsync();

    public Task<int> CreateRecommendationAsync(Recommendation recommendation)
        => _recommendations.AddAsync(recommendation);

    public Task<bool> UpdateRecommendationAsync(Recommendation recommendation)
        => _recommendations.UpdateAsync(recommendation);

    public Task<bool> DeleteRecommendationAsync(int id)
        => _recommendations.DeleteAsync(id);
}
