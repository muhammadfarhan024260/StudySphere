using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudySphere.Data;

namespace StudySphere.Controllers;

/// <summary>
/// Public (no auth) endpoints for dropdown data needed on the signup form.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly StudySphereDbContext _context;

    public ConfigController(StudySphereDbContext context)
    {
        _context = context;
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _context.Departments
            .OrderBy(d => d.Name)
            .Select(d => new { d.DepartmentId, d.Name })
            .ToListAsync();
        return Ok(new { success = true, data = departments });
    }

    [HttpGet("semesters")]
    public async Task<IActionResult> GetSemesters()
    {
        var semesters = await _context.SemesterOptions
            .OrderBy(s => s.Name)
            .Select(s => new { s.SemesterOptionId, s.Name })
            .ToListAsync();
        return Ok(new { success = true, data = semesters });
    }
}
