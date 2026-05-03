using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;

namespace StudySphere.Repositories;

public class SubjectRepository : ISubjectRepository
{
    private readonly StudySphereDbContext _context;

    public SubjectRepository(StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Subject>> GetAllAsync()
    {
        return await _context.Subjects.ToListAsync();
    }

    public async Task<Subject?> GetByIdAsync(int subjectId)
    {
        return await _context.Subjects.FirstOrDefaultAsync(s => s.SubjectId == subjectId);
    }

    public async Task<Subject> CreateAsync(Subject subject)
    {
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return subject;
    }

    public async Task UpdateAsync(Subject subject)
    {
        _context.Subjects.Update(subject);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int subjectId)
    {
        var subject = await _context.Subjects.FindAsync(subjectId);
        if (subject != null)
        {
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
        }
    }
}
