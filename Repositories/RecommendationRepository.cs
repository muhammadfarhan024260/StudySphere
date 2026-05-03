using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;

namespace StudySphere.Repositories;

public class RecommendationRepository : IRecommendationRepository
{
    private readonly StudySphereDbContext _context;

    public RecommendationRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<int> AddAsync(Recommendation recommendation)
    {
        _context.Recommendations.Add(recommendation);
        await _context.SaveChangesAsync();
        return recommendation.RecommendationId;
    }

    public async Task<bool> UpdateAsync(Recommendation recommendation)
    {
        var existing = await _context.Recommendations.FindAsync(recommendation.RecommendationId);
        if (existing == null) return false;

        existing.Title = recommendation.Title;
        existing.Content = recommendation.Content;
        existing.SubjectId = recommendation.SubjectId;
        existing.MinScoreThreshold = recommendation.MinScoreThreshold;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.Recommendations.FindAsync(id);
        if (existing == null) return false;
        _context.Recommendations.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    // Admin listing: JOIN recommendation × subject × admin.
    public async Task<IEnumerable<Recommendation>> GetAllWithJoinsAsync()
    {
        var results = new List<Recommendation>();

        await _context.Database.OpenConnectionAsync();
        try
        {
            var conn = _context.Database.GetDbConnection();
            const string sql = @"
                SELECT r.recommendation_id,
                       r.subject_id,
                       r.admin_id,
                       r.title,
                       r.content,
                       r.min_score_threshold,
                       r.created_date,
                       s.name AS subject_name,
                       a.name AS authored_by
                  FROM recommendation r
                  INNER JOIN subject s ON s.subject_id = r.subject_id
                  INNER JOIN admin   a ON a.admin_id   = r.admin_id
                 ORDER BY r.created_date DESC";

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new Recommendation
                {
                    RecommendationId = reader.GetInt32(reader.GetOrdinal("recommendation_id")),
                    SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                    AdminId = reader.GetInt32(reader.GetOrdinal("admin_id")),
                    Title = reader.GetString(reader.GetOrdinal("title")),
                    Content = reader.GetString(reader.GetOrdinal("content")),
                    MinScoreThreshold = reader.GetInt32(reader.GetOrdinal("min_score_threshold")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                    SubjectName = reader.GetString(reader.GetOrdinal("subject_name")),
                    AuthoredBy = reader.GetString(reader.GetOrdinal("authored_by"))
                });
            }
        }
        finally
        {
            await _context.Database.CloseConnectionAsync();
        }

        return results;
    }

    // Student-facing: only return recommendations for subjects where this
    // student has a weak_area row whose avg falls below the threshold.
    public async Task<IEnumerable<Recommendation>> GetForStudentAsync(int studentId)
    {
        var results = new List<Recommendation>();

        await _context.Database.OpenConnectionAsync();
        try
        {
            var conn = _context.Database.GetDbConnection();
            const string sql = @"
                SELECT r.recommendation_id,
                       r.subject_id,
                       r.admin_id,
                       r.title,
                       r.content,
                       r.min_score_threshold,
                       r.created_date,
                       s.name AS subject_name,
                       a.name AS authored_by
                  FROM recommendation r
                  INNER JOIN subject  s ON s.subject_id = r.subject_id
                  INNER JOIN admin    a ON a.admin_id   = r.admin_id
                  INNER JOIN weak_area w ON w.subject_id = r.subject_id
                                        AND w.student_id = @p_student_id
                                        AND w.avg_score < r.min_score_threshold
                 ORDER BY r.created_date DESC";

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            var param = cmd.CreateParameter();
            param.ParameterName = "p_student_id";
            param.Value = studentId;
            cmd.Parameters.Add(param);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new Recommendation
                {
                    RecommendationId = reader.GetInt32(reader.GetOrdinal("recommendation_id")),
                    SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                    AdminId = reader.GetInt32(reader.GetOrdinal("admin_id")),
                    Title = reader.GetString(reader.GetOrdinal("title")),
                    Content = reader.GetString(reader.GetOrdinal("content")),
                    MinScoreThreshold = reader.GetInt32(reader.GetOrdinal("min_score_threshold")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                    SubjectName = reader.GetString(reader.GetOrdinal("subject_name")),
                    AuthoredBy = reader.GetString(reader.GetOrdinal("authored_by"))
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
