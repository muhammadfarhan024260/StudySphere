using Microsoft.EntityFrameworkCore;
using Npgsql;
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

    // Calls sp_get_weak_subjects(p_student_id) — populates SubjectName from
    // the JOIN performed inside the function.
    public async Task<IEnumerable<WeakArea>> GetByStudentIdAsync(int studentId)
    {
        var results = new List<WeakArea>();

        var connectionString = _context.Database.GetDbConnection().ConnectionString;
        await using var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand("SELECT * FROM sp_get_weak_subjects(@p_student_id)", conn);
        cmd.Parameters.AddWithValue("p_student_id", studentId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new WeakArea
            {
                SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                SubjectName = reader.GetString(reader.GetOrdinal("subject_name")),
                AvgScore = reader.GetDecimal(reader.GetOrdinal("avg_score")),
                DetectedDate = reader.GetDateTime(reader.GetOrdinal("detected_date")),
                StudentId = studentId
            });
        }

        return results;
    }
}
