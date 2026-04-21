using Microsoft.EntityFrameworkCore;
using StudySphere.Models;
using StudySphere.Data;

namespace StudySphere.Repositories;

public class StudyLogRepository : IStudyLogRepository
{
    private readonly StudySphereDbContext _context;

    public StudyLogRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<int> AddAsync(StudyLog log)
    {
        _context.StudyLogs.Add(log);
        await _context.SaveChangesAsync();
        return log.LogId;
    }

    public async Task<bool> UpdateAsync(StudyLog log)
    {
        _context.StudyLogs.Update(log);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var log = await _context.StudyLogs.FindAsync(id);
        if (log == null) return false;
        
        _context.StudyLogs.Remove(log);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<StudyLog>> GetByStudentIdAsync(int studentId)
    {
        return await _context.StudyLogs
            .Where(l => l.StudentId == studentId)
            .OrderByDescending(l => l.DateLogged)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudyLog>> GetAllWithSubjectNamesAsync(int studentId)
    {
        var logs = await _context.StudyLogs
            .FromSqlRaw(
                @"SELECT sl.log_id as LogId, sl.student_id as StudentId, sl.subject_id as SubjectId, 
                        sl.hours_studied as HoursStudied, sl.productivity_score as ProductivityScore,
                        sl.date_logged as DateLogged, sl.notes as Notes, s.name as SubjectName
                 FROM study_log sl 
                 JOIN subject s ON sl.subject_id = s.subject_id 
                 WHERE sl.student_id = {0} 
                 ORDER BY sl.date_logged DESC", studentId)
            .ToListAsync();
        
        return logs;
    }
}
