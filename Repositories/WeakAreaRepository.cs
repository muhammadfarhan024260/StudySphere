using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;

namespace StudySphere.Repositories;

public class WeakAreaRepository : IWeakAreaRepository
{
    private readonly StudySphereDbContext _context;

    public WeakAreaRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    // Lab 10: calls sp_get_weak_subjects(p_student_id) stored procedure
    public async Task<IEnumerable<WeakArea>> GetByStudentIdAsync(int studentId)
    {
        var results = new List<WeakArea>();

        await _context.Database.OpenConnectionAsync();
        try
        {
            var conn = _context.Database.GetDbConnection();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM sp_get_weak_subjects(@p_student_id)";
            var param = cmd.CreateParameter();
            param.ParameterName = "p_student_id";
            param.Value = studentId;
            cmd.Parameters.Add(param);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new WeakArea
                {
                    SubjectId   = reader.GetInt32(reader.GetOrdinal("subject_id")),
                    SubjectName = reader.GetString(reader.GetOrdinal("subject_name")),
                    AvgScore    = reader.GetDecimal(reader.GetOrdinal("avg_score")),
                    DetectedDate = reader.GetDateTime(reader.GetOrdinal("detected_date")),
                    StudentId   = studentId
                });
            }
        }
        finally
        {
            await _context.Database.CloseConnectionAsync();
        }

        return results;
    }

    public async Task<WeakArea?> GetByStudentAndSubjectAsync(int studentId, int subjectId)
    {
        return await _context.WeakAreas
            .FirstOrDefaultAsync(w => w.StudentId == studentId && w.SubjectId == subjectId);
    }

    public async Task<WeakArea> CreateAsync(WeakArea weakArea)
    {
        _context.WeakAreas.Add(weakArea);
        await _context.SaveChangesAsync();
        return weakArea;
    }

    public async Task UpdateAsync(WeakArea weakArea)
    {
        _context.WeakAreas.Update(weakArea);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int weakAreaId)
    {
        var entity = await _context.WeakAreas.FindAsync(weakAreaId);
        if (entity != null)
        {
            _context.WeakAreas.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
