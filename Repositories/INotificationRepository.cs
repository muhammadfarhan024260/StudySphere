using StudySphere.Models;

namespace StudySphere.Repositories;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByStudentIdAsync(int studentId);
    Task<bool> MarkReadAsync(int notificationId);
    Task<int> AddAsync(Notification notification);
    Task<bool> HasNotificationForSubjectAsync(int studentId, int subjectId, string type);
}
