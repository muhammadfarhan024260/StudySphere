using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;

namespace StudySphere.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly StudySphereDbContext _context;

    public NotificationRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByStudentIdAsync(int studentId)
    {
        return await _context.Notifications
            .Where(n => n.StudentId == studentId)
            .OrderByDescending(n => n.CreatedDate)
            .ToListAsync();
    }

    public async Task<bool> MarkReadAsync(int notificationId)
    {
        var notif = await _context.Notifications.FindAsync(notificationId);
        if (notif == null) return false;

        notif.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification.NotificationId;
    }

    public async Task<bool> HasNotificationForSubjectAsync(int studentId, int subjectId, string type)
    {
        return await _context.Notifications
            .AnyAsync(n => n.StudentId == studentId && n.RelatedSubjectId == (int?)subjectId && n.Type == type);
    }

    public async Task<bool> DeleteByStudentIdAsync(int studentId)
    {
        var notifs = _context.Notifications.Where(n => n.StudentId == studentId);
        _context.Notifications.RemoveRange(notifs);
        await _context.SaveChangesAsync();
        return true;
    }
}
