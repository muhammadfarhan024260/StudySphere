using Npgsql;
using StudySphere.Models;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace StudySphere.Repositories;

public class StudyLogRepository : IStudyLogRepository
{
    private readonly string _connectionString;

    public StudyLogRepository(IConfiguration configuration)
    {
        _connectionString = Environment.GetEnvironmentVariable("connection_string") 
                            ?? configuration.GetConnectionString("DefaultConnection") 
                            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<int> AddAsync(StudyLog log)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(
            "INSERT INTO study_log (student_id, subject_id, hours_studied, productivity_score, date_logged, notes) " +
            "VALUES (@studentId, @subjectId, @hours, @prod, @date, @notes) RETURNING log_id", conn);
        
        cmd.Parameters.AddWithValue("studentId", log.StudentId);
        cmd.Parameters.AddWithValue("subjectId", log.SubjectId);
        cmd.Parameters.AddWithValue("hours", log.HoursStudied);
        cmd.Parameters.AddWithValue("prod", log.ProductivityScore);
        cmd.Parameters.AddWithValue("date", log.DateLogged);
        cmd.Parameters.AddWithValue("notes", (object?)log.Notes ?? DBNull.Value);
        
        var result = await cmd.ExecuteScalarAsync();
        return result != null ? (int)result : 0;
    }

    public async Task<bool> UpdateAsync(StudyLog log)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(
            "UPDATE study_log SET hours_studied = @hours, productivity_score = @prod, notes = @notes WHERE log_id = @id", conn);
        
        cmd.Parameters.AddWithValue("hours", log.HoursStudied);
        cmd.Parameters.AddWithValue("prod", log.ProductivityScore);
        cmd.Parameters.AddWithValue("notes", (object?)log.Notes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("id", log.LogId);
        
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand("DELETE FROM study_log WHERE log_id = @id", conn);
        cmd.Parameters.AddWithValue("id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<IEnumerable<StudyLog>> GetByStudentIdAsync(int studentId)
    {
        var logs = new List<StudyLog>();
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand("SELECT * FROM study_log WHERE student_id = @sid ORDER BY date_logged DESC", conn);
        cmd.Parameters.AddWithValue("sid", studentId);
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            logs.Add(new StudyLog {
                LogId = reader.GetInt32(reader.GetOrdinal("log_id")),
                StudentId = reader.GetInt32(reader.GetOrdinal("student_id")),
                SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                HoursStudied = reader.GetDecimal(reader.GetOrdinal("hours_studied")),
                ProductivityScore = reader.GetInt32(reader.GetOrdinal("productivity_score")),
                DateLogged = reader.GetDateTime(reader.GetOrdinal("date_logged")),
                Notes = reader.IsDBNull(reader.GetOrdinal("notes")) ? null : reader.GetString(reader.GetOrdinal("notes"))
            });
        }
        return logs;
    }

    public async Task<IEnumerable<StudyLog>> GetAllWithSubjectNamesAsync(int studentId)
    {
        var logs = new List<StudyLog>();
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(
            "SELECT sl.*, s.name FROM study_log sl JOIN subject s ON sl.subject_id = s.subject_id WHERE sl.student_id = @sid ORDER BY sl.date_logged DESC", conn);
        cmd.Parameters.AddWithValue("sid", studentId);
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            logs.Add(new StudyLog {
                LogId = reader.GetInt32(reader.GetOrdinal("log_id")),
                StudentId = reader.GetInt32(reader.GetOrdinal("student_id")),
                SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                HoursStudied = reader.GetDecimal(reader.GetOrdinal("hours_studied")),
                ProductivityScore = reader.GetInt32(reader.GetOrdinal("productivity_score")),
                DateLogged = reader.GetDateTime(reader.GetOrdinal("date_logged")),
                Notes = reader.IsDBNull(reader.GetOrdinal("notes")) ? null : reader.GetString(reader.GetOrdinal("notes")),
                SubjectName = reader.GetString(reader.GetOrdinal("name"))
            });
        }
        return logs;
    }
}
