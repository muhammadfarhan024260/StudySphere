using Microsoft.EntityFrameworkCore;
using StudySphere.Models;
using StudySphere.Data;

namespace StudySphere.Repositories;

public class GoalRepository : IGoalRepository
{
    private readonly StudySphereDbContext _context;

    public GoalRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<int> AddAsync(Goal goal)
    {
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();
        return goal.GoalId;
    }

    public async Task<bool> UpdateAsync(Goal goal)
    {
        _context.Goals.Update(goal);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null) return false;
        
        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Goal>> GetByStudentIdAsync(int studentId)
    {
        var goals = await _context.Goals
            .Where(g => g.StudentId == studentId)
            .ToListAsync();

        if (!goals.Any()) return goals;

        var subjectIds = goals.Select(g => g.SubjectId).Distinct().ToList();
        var subjects = await _context.Subjects
            .Where(s => subjectIds.Contains(s.SubjectId))
            .ToDictionaryAsync(s => s.SubjectId, s => s.Name);

        foreach (var goal in goals)
            if (subjects.TryGetValue(goal.SubjectId, out var name))
                goal.SubjectName = name;

        return goals;
    }
}
