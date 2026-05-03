using StudySphere.Models;
using StudySphere.Repositories;

namespace StudySphere.Services;

public class IntelligenceService : IIntelligenceService
{
    private readonly IWeakAreaRepository _weakAreas;
    private readonly INotificationRepository _notifications;
    private readonly IRecommendationRepository _recommendations;
    private readonly IStudyLogRepository _studyLogs;

    public IntelligenceService(
        IWeakAreaRepository weakAreas,
        INotificationRepository notifications,
        IRecommendationRepository recommendations,
        IStudyLogRepository studyLogs)
    {
        _weakAreas = weakAreas;
        _notifications = notifications;
        _recommendations = recommendations;
        _studyLogs = studyLogs;
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

    public async Task AnalyzeSessionAsync(int studentId, int subjectId)
    {
        var logs = await _studyLogs.GetByStudentIdAsync(studentId);
        var subjectLogs = logs.Where(l => l.SubjectId == subjectId).ToList();
        
        if (!subjectLogs.Any()) return;

        var avgScore = (decimal)subjectLogs.Average(l => l.ProductivityScore);
        
        // Threshold for Weak Area
        if (avgScore < 6.0m)
        {
            var weakArea = await _weakAreas.GetByStudentAndSubjectAsync(studentId, subjectId);
            if (weakArea == null)
            {
                await _weakAreas.CreateAsync(new WeakArea
                {
                    StudentId = studentId,
                    SubjectId = subjectId,
                    AvgScore = avgScore,
                    DetectedDate = DateTime.Now
                });
            }
            else
            {
                weakArea.AvgScore = avgScore;
                weakArea.DetectedDate = DateTime.Now;
                await _weakAreas.UpdateAsync(weakArea);
            }

            // Check for Recommendations
            var allRecs = await _recommendations.GetForStudentAsync(studentId);
            // Since GetForStudentAsync might already filter, let's just get all and filter by subject
            // Wait, we can just get all recommendations from the system
            var systemRecs = await _recommendations.GetAllWithJoinsAsync();
            var matchedRecs = systemRecs.Where(r => r.SubjectId == subjectId && avgScore <= r.MinScoreThreshold);

            foreach (var rec in matchedRecs)
            {
                var hasNotif = await _notifications.HasNotificationForSubjectAsync(studentId, subjectId, "Recommendation");
                if (!hasNotif)
                {
                    await _notifications.AddAsync(new Notification
                    {
                        StudentId = studentId,
                        RelatedSubjectId = subjectId,
                        Type = "Recommendation",
                        Message = $"New recommendation available for {rec.SubjectName}: {rec.Title}",
                        IsRead = false,
                        CreatedDate = DateTime.Now
                    });
                }
            }
        }
    }
}
