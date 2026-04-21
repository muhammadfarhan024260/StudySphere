using Microsoft.EntityFrameworkCore;
using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IAdminRepository
{
    Task<Admin?> GetByEmailAsync(string email);
    Task<Admin?> GetByIdAsync(int adminId);
    Task<Admin> CreateAsync(Admin admin);
    Task<bool> EmailExistsAsync(string email);
    Task UpdateAsync(Admin admin);
}

public class AdminRepository : IAdminRepository
{
    private readonly StudySphere.Data.StudySphereDbContext _context;

    public AdminRepository(StudySphere.Data.StudySphereDbContext context)
    {
        _context = context;
    }

    public async Task<Admin?> GetByEmailAsync(string email)
    {
        return await _context.Admins.FirstOrDefaultAsync(a => a.Email == email);
    }

    public async Task<Admin?> GetByIdAsync(int adminId)
    {
        return await _context.Admins.FirstOrDefaultAsync(a => a.AdminId == adminId);
    }

    public async Task<Admin> CreateAsync(Admin admin)
    {
        _context.Admins.Add(admin);
        await _context.SaveChangesAsync();
        return admin;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Admins.AnyAsync(a => a.Email == email);
    }

    public async Task UpdateAsync(Admin admin)
    {
        _context.Admins.Update(admin);
        await _context.SaveChangesAsync();
    }
}
