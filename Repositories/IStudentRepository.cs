using Microsoft.EntityFrameworkCore;
using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IStudentRepository
{
    Task<Student?> GetByEmailAsync(string email);
    Task<Student?> GetByIdAsync(int studentId);
    Task<Student> CreateAsync(Student student);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> EnrollmentNumberExistsAsync(string enrollmentNumber);
    Task UpdateAsync(Student student);
}

public class StudentRepository : IStudentRepository
{
    private readonly StudySphere.Data.StudySphereDbContext _context;

    public StudentRepository(StudySphere.Data.StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<Student?> GetByEmailAsync(string email)
    {
        return await _context.Students.FirstOrDefaultAsync(s => s.Email == email);
    }

    public async Task<Student?> GetByIdAsync(int studentId)
    {
        return await _context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
    }

    public async Task<Student> CreateAsync(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();
        return student;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Students.AnyAsync(s => s.Email == email);
    }

    public async Task<bool> EnrollmentNumberExistsAsync(string enrollmentNumber)
    {
        return await _context.Students.AnyAsync(s => s.EnrollmentNumber == enrollmentNumber);
    }

    public async Task UpdateAsync(Student student)
    {
        _context.Students.Update(student);
        await _context.SaveChangesAsync();
    }
}
