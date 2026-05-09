using StudySphere.Models;

namespace StudySphere.Services;

public interface IIntelligenceService
{
    Task<IEnumerable<WeakArea>> GetWeakSubjectsAsync(int studentId);
    Task<IEnumerable<Notification>> GetNotificationsAsync(int studentId);
    Task<bool> MarkNotificationReadAsync(int notificationId);
    Task<bool> ClearNotificationsAsync(int studentId);
    Task<IEnumerable<Recommendation>> GetRecommendationsForStudentAsync(int studentId);

    // Admin-side
    Task<IEnumerable<Recommendation>> GetAllRecommendationsAsync();
    Task<int> CreateRecommendationAsync(Recommendation recommendation);
    Task<bool> UpdateRecommendationAsync(Recommendation recommendation);
    Task<bool> DeleteRecommendationAsync(int id);
    
    // Core Intelligence Engine
    Task AnalyzeSessionAsync(int studentId, int subjectId);
}
