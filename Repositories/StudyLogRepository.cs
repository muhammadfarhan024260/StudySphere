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
            .Where(sl => sl.StudentId == studentId)
            .OrderByDescending(sl => sl.DateLogged)
            .ToListAsync();

        if (!logs.Any()) return logs;

        var subjectIds = logs.Select(l => l.SubjectId).Distinct().ToList();
        var subjects = await _context.Subjects
            .Where(s => subjectIds.Contains(s.SubjectId))
            .ToDictionaryAsync(s => s.SubjectId, s => s.Name);

        foreach (var log in logs)
            if (subjects.TryGetValue(log.SubjectId, out var name))
                log.SubjectName = name;

        return logs;
    }

    // Lab 9: queries the vw_weekly_report VIEW
    public async Task<IEnumerable<WeeklyReportEntry>> GetWeeklyReportAsync(int studentId)
    {
        var results = new List<WeeklyReportEntry>();

        await _context.Database.OpenConnectionAsync();
        try
        {
            var conn = _context.Database.GetDbConnection();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM vw_weekly_report WHERE student_id = @p_student_id ORDER BY week_start DESC";
            var param = cmd.CreateParameter();
            param.ParameterName = "p_student_id";
            param.Value = studentId;
            cmd.Parameters.Add(param);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new WeeklyReportEntry
                {
                    StudentId    = reader.GetInt32(reader.GetOrdinal("student_id")),
                    StudentName  = reader.GetString(reader.GetOrdinal("student_name")),
                    SubjectId    = reader.GetInt32(reader.GetOrdinal("subject_id")),
                    SubjectName  = reader.GetString(reader.GetOrdinal("subject_name")),
                    WeekStart    = reader.GetDateTime(reader.GetOrdinal("week_start")),
                    SessionCount = reader.GetInt32(reader.GetOrdinal("session_count")),
                    TotalHours   = reader.GetDecimal(reader.GetOrdinal("total_hours")),
                    AvgProductivity = reader.GetDecimal(reader.GetOrdinal("avg_productivity")),
                    MaxProductivity = reader.GetDecimal(reader.GetOrdinal("max_productivity")),
                });
            }
        }
        finally
        {
            await _context.Database.CloseConnectionAsync();
        }

        return results;
    }
}
