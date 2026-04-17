using Npgsql;
using StudySphere.Models;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace StudySphere.Repositories;

public class GoalRepository : IGoalRepository
{
    private readonly string _connectionString;

    public GoalRepository(IConfiguration configuration)
    {
        _connectionString = Environment.GetEnvironmentVariable("connection_string") 
                            ?? configuration.GetConnectionString("DefaultConnection") 
                            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<int> AddAsync(Goal goal)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(
            "INSERT INTO goal (student_id, subject_id, goal_type, target_hours, deadline, is_completed) " +
            "VALUES (@studentId, @subjectId, @type, @hours, @deadline, @completed) RETURNING goal_id", conn);
        
        cmd.Parameters.AddWithValue("studentId", goal.StudentId);
        cmd.Parameters.AddWithValue("subjectId", goal.SubjectId);
        cmd.Parameters.AddWithValue("type", goal.GoalType);
        cmd.Parameters.AddWithValue("hours", goal.TargetHours);
        cmd.Parameters.AddWithValue("deadline", goal.Deadline);
        cmd.Parameters.AddWithValue("completed", goal.IsCompleted);
        
        var result = await cmd.ExecuteScalarAsync();
        return result != null ? (int)result : 0;
    }

    public async Task<bool> UpdateAsync(Goal goal)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(
            "UPDATE goal SET target_hours = @hours, is_completed = @completed WHERE goal_id = @id", conn);
        
        cmd.Parameters.AddWithValue("hours", goal.TargetHours);
        cmd.Parameters.AddWithValue("completed", goal.IsCompleted);
        cmd.Parameters.AddWithValue("id", goal.GoalId);
        
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand("DELETE FROM goal WHERE goal_id = @id", conn);
        cmd.Parameters.AddWithValue("id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<IEnumerable<Goal>> GetByStudentIdAsync(int studentId)
    {
        var goals = new List<Goal>();
        using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand("SELECT * FROM goal WHERE student_id = @sid", conn);
        cmd.Parameters.AddWithValue("sid", studentId);
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            goals.Add(new Goal {
                GoalId = reader.GetInt32(reader.GetOrdinal("goal_id")),
                StudentId = reader.GetInt32(reader.GetOrdinal("student_id")),
                SubjectId = reader.GetInt32(reader.GetOrdinal("subject_id")),
                GoalType = reader.GetString(reader.GetOrdinal("goal_type")),
                TargetHours = reader.GetDecimal(reader.GetOrdinal("target_hours")),
                Deadline = reader.GetDateTime(reader.GetOrdinal("deadline")),
                IsCompleted = reader.GetBoolean(reader.GetOrdinal("is_completed"))
            });
        }
        return goals;
    }
}
