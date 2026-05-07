using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudySphere.Data;
using StudySphere.Models;
using StudySphere.Repositories;
using StudySphere.Patterns.Singleton;
using StudySphere.Patterns.Adapter;

namespace StudySphere.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IStudentRepository _studentRepository;
    private readonly StudySphereDbContext _context;
    private readonly DatabaseConnectionSingleton _dbSingleton;

    public AdminController(IStudentRepository studentRepository, StudySphereDbContext context, DatabaseConnectionSingleton dbSingleton)
    {
        _studentRepository = studentRepository;
        _context = context;
        _dbSingleton = dbSingleton;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents()
    {
        try
        {
            var students = await _studentRepository.GetAllAsync();
            var studentList = students.Select(s => new
            {
                id = s.StudentId,
                name = s.Name,
                email = s.Email,
                enrollment = s.EnrollmentNumber,
                status = s.IsActive ? "Active" : "Inactive",
                hours = 0,
                goals = 0
            });

            return Ok(new { success = true, students = studentList });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch students.", error = ex.Message });
        }
    }

    [HttpPut("students/{id}")]
    public async Task<IActionResult> UpdateStudent(int id, [FromBody] Student updateDto)
    {
        try
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
                return NotFound(new { success = false, message = "Student not found." });

            student.Name = updateDto.Name;
            student.Email = updateDto.Email;
            student.EnrollmentNumber = updateDto.EnrollmentNumber;
            student.IsActive = updateDto.IsActive;

            await _studentRepository.UpdateAsync(student);
            return Ok(new { success = true, message = "Student updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to update student.", error = ex.Message });
        }
    }

    [HttpDelete("students/{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        try
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
                return NotFound(new { success = false, message = "Student not found." });

            await _studentRepository.DeleteAsync(id);
            return Ok(new { success = true, message = "Student deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to delete student.", error = ex.Message });
        }
    }

    // Lab 12 (partial) + real overview — replaces mock data
    [HttpGet("analytics/overview")]
    public async Task<IActionResult> GetAnalyticsOverview()
    {
        try
        {
            var students = await _studentRepository.GetAllAsync();
            var totalStudents = students.Count();
            var activeStudents = students.Count(s => s.IsActive);

            var logs = await _context.StudyLogs.ToListAsync();
            var totalSessions = logs.Count;
            var avgProductivity = logs.Count > 0
                ? Math.Round(logs.Average(l => (double)l.ProductivityScore), 1)
                : 0.0;

            // Weekly stats: total hours per day for the last 7 days
            var weekStart = DateTime.Today.AddDays(-6);
            var recentLogs = logs.Where(l => l.DateLogged >= weekStart).ToList();
            var weeklyStats = Enumerable.Range(0, 7).Select(i =>
            {
                var day = weekStart.AddDays(i);
                var hours = recentLogs
                    .Where(l => l.DateLogged.Date == day.Date)
                    .Sum(l => (double)l.HoursStudied);
                return new { day = day.DayOfWeek.ToString()[..3], hours = Math.Round(hours, 1) };
            }).ToList();

            var totalHoursLogged = logs.Count > 0
                ? Math.Round((double)logs.Sum(l => l.HoursStudied), 1)
                : 0.0;

            return Ok(new
            {
                success = true,
                data = new
                {
                    engagementRate  = totalStudents > 0 ? (int)((double)activeStudents / totalStudents * 100) : 0,
                    avgProductivity,
                    totalSessions,
                    totalHoursLogged,
                    totalStudents,
                    activeStudents,
                    weeklyStats
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch analytics.", error = ex.Message });
        }
    }

    // Lab 12: GROUP BY ROLLUP — returns hierarchical subtotals
    [HttpGet("analytics/rollup")]
    public async Task<IActionResult> GetRollupAnalytics()
    {
        try
        {
            var rows = new List<object>();

            await _context.Database.OpenConnectionAsync();
            try
            {
                var conn = _context.Database.GetDbConnection();
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    SELECT
                        sl.student_id,
                        sl.subject_id,
                        sub.name                                          AS subject_name,
                        EXTRACT(YEAR  FROM sl.date_logged)::INT          AS year,
                        EXTRACT(MONTH FROM sl.date_logged)::INT          AS month,
                        COUNT(sl.log_id)                                 AS session_count,
                        ROUND(SUM(sl.hours_studied)::NUMERIC, 2)         AS total_hours,
                        ROUND(AVG(sl.productivity_score)::NUMERIC, 1)    AS avg_productivity
                    FROM study_log sl
                    JOIN subject sub ON sub.subject_id = sl.subject_id
                    GROUP BY ROLLUP(
                        sl.student_id,
                        sl.subject_id, sub.name,
                        EXTRACT(YEAR  FROM sl.date_logged),
                        EXTRACT(MONTH FROM sl.date_logged)
                    )
                    ORDER BY sl.student_id NULLS LAST,
                             sl.subject_id NULLS LAST,
                             year NULLS LAST,
                             month NULLS LAST";

                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    int ord(string col) => reader.GetOrdinal(col);
                    rows.Add(new
                    {
                        studentId    = reader.IsDBNull(ord("student_id"))    ? (int?)null    : reader.GetInt32(ord("student_id")),
                        subjectId    = reader.IsDBNull(ord("subject_id"))    ? (int?)null    : reader.GetInt32(ord("subject_id")),
                        subjectName  = reader.IsDBNull(ord("subject_name"))  ? null          : reader.GetString(ord("subject_name")),
                        year         = reader.IsDBNull(ord("year"))          ? (int?)null    : reader.GetInt32(ord("year")),
                        month        = reader.IsDBNull(ord("month"))         ? (int?)null    : reader.GetInt32(ord("month")),
                        sessionCount = reader.GetInt64(ord("session_count")),
                        totalHours   = reader.IsDBNull(ord("total_hours"))   ? (decimal?)null : reader.GetDecimal(ord("total_hours")),
                        avgProductivity = reader.IsDBNull(ord("avg_productivity")) ? (decimal?)null : reader.GetDecimal(ord("avg_productivity")),
                    });
                }
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }

            return Ok(new { success = true, data = rows });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch rollup analytics.", error = ex.Message });
        }
    }

    // Lab 6: subquery — students whose personal avg productivity < system-wide avg
    [HttpGet("analytics/below-average")]
    public async Task<IActionResult> GetBelowAverageStudents()
    {
        try
        {
            var logs = await _context.StudyLogs.ToListAsync();
            if (!logs.Any()) return Ok(new { success = true, data = Array.Empty<object>() });

            var systemAvg = logs.Average(l => (double)l.ProductivityScore);

            var studentAvgs = logs
                .GroupBy(l => l.StudentId)
                .Select(g => new { StudentId = g.Key, Avg = g.Average(l => (double)l.ProductivityScore) })
                .Where(x => x.Avg < systemAvg)
                .ToList();

            var ids = studentAvgs.Select(x => x.StudentId).ToList();
            var studentsDict = (await _context.Students
                .Where(s => ids.Contains(s.StudentId))
                .ToListAsync())
                .ToDictionary(s => s.StudentId);

            var result = studentAvgs
                .Select(x => new
                {
                    studentId = x.StudentId,
                    name      = studentsDict.TryGetValue(x.StudentId, out var s) ? s.Name  : "Unknown",
                    email     = studentsDict.TryGetValue(x.StudentId, out var s2) ? s2.Email : "",
                    avgScore  = Math.Round(x.Avg, 1),
                    systemAvg = Math.Round(systemAvg, 1)
                })
                .OrderBy(x => x.avgScore)
                .ToList();

            return Ok(new { success = true, systemAvg = Math.Round(systemAvg, 1), data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch below-average students.", error = ex.Message });
        }
    }

    // Weak area stats — grouped by subject across all students
    [HttpGet("analytics/weak-areas")]
    public async Task<IActionResult> GetWeakAreaStats()
    {
        try
        {
            var weakAreas = await _context.WeakAreas.ToListAsync();
            if (!weakAreas.Any())
                return Ok(new { success = true, totalWeakAreas = 0, affectedStudents = 0, topSubjects = Array.Empty<object>() });

            var subjectIds = weakAreas.Select(w => w.SubjectId).Distinct().ToList();
            var subjectsDict = await _context.Subjects
                .Where(s => subjectIds.Contains(s.SubjectId))
                .ToDictionaryAsync(s => s.SubjectId, s => s.Name);

            var topSubjects = weakAreas
                .GroupBy(w => w.SubjectId)
                .Select(g => new
                {
                    subject  = subjectsDict.TryGetValue(g.Key, out var name) ? name : $"Subject #{g.Key}",
                    count    = g.Select(w => w.StudentId).Distinct().Count(),
                    avgScore = Math.Round((double)g.Average(w => w.AvgScore), 1),
                })
                .OrderByDescending(x => x.count)
                .Take(5)
                .ToList<object>();

            return Ok(new
            {
                success          = true,
                totalWeakAreas   = weakAreas.Count,
                affectedStudents = weakAreas.Select(w => w.StudentId).Distinct().Count(),
                topSubjects,
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch weak area stats.", error = ex.Message });
        }
    }

    // Admin profile — returns name, email, join date for the authenticated admin
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");
            if (idClaim == null || !int.TryParse(idClaim.Value, out var adminId))
                return Unauthorized();

            var admin = await _context.Admins.FindAsync(adminId);
            if (admin == null) return NotFound();

            return Ok(new
            {
                success  = true,
                name     = admin.Name,
                email    = admin.Email,
                joinDate = admin.CreatedDate.ToString("MMMM yyyy"),
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch profile.", error = ex.Message });
        }
    }

    // Adapter Pattern: export analytics report as CSV or JSON
    [HttpGet("reports/export")]
    public async Task<IActionResult> ExportReport([FromQuery] string format = "csv")
    {
        try
        {
            var students = await _studentRepository.GetAllAsync();
            var logs     = await _context.StudyLogs.ToListAsync();

            var data = new ReportData
            {
                TotalStudents   = students.Count(),
                ActiveStudents  = students.Count(s => s.IsActive),
                TotalSessions   = logs.Count,
                AvgProductivity = logs.Any() ? Math.Round(logs.Average(l => (double)l.ProductivityScore), 1) : 0
            };

            // Singleton: use the shared connection factory for the raw per-subject aggregation
            await using var conn = await _dbSingleton.CreateOpenConnectionAsync();
            await using var cmd  = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT sub.name                                        AS subject_name,
                       COUNT(sl.log_id)                               AS sessions,
                       ROUND(SUM(sl.hours_studied)::NUMERIC, 2)       AS total_hours,
                       ROUND(AVG(sl.productivity_score)::NUMERIC, 1)  AS avg_productivity
                FROM study_log sl
                JOIN subject sub ON sub.subject_id = sl.subject_id
                GROUP BY sub.name
                ORDER BY sessions DESC
                LIMIT 10";

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                data.TopSubjects.Add(new SubjectSummaryRow
                {
                    SubjectName    = reader.GetString(0),
                    Sessions       = (int)reader.GetInt64(1),
                    TotalHours     = reader.IsDBNull(2) ? 0 : (double)reader.GetDecimal(2),
                    AvgProductivity = reader.IsDBNull(3) ? 0 : (double)reader.GetDecimal(3)
                });
            }

            // Weekly stats (in-memory from already-loaded logs)
            var weekStart  = DateTime.Today.AddDays(-6);
            var recentLogs = logs.Where(l => l.DateLogged >= weekStart).ToList();
            data.WeeklyStats = Enumerable.Range(0, 7).Select(i =>
            {
                var day   = weekStart.AddDays(i);
                var hours = recentLogs.Where(l => l.DateLogged.Date == day.Date).Sum(l => (double)l.HoursStudied);
                return new WeeklyStatRow { Day = day.DayOfWeek.ToString()[..3], Hours = Math.Round(hours, 1) };
            }).ToList();

            // Adapter: select the right format adapter and generate the file
            var generator = ReportGeneratorFactory.Create(format);
            var fileBytes = generator.Generate(data);
            var fileName  = $"studysphere-report-{DateTime.Today:yyyy-MM-dd}.{generator.FileExtension}";

            return File(fileBytes, generator.ContentType, fileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to generate report.", error = ex.Message });
        }
    }

    // Lab 5 INTERSECT: students who logged a session this week AND have an active goal
    [HttpGet("analytics/engaged-students")]
    public async Task<IActionResult> GetEngagedStudents()
    {
        try
        {
            var weekAgo = DateTime.Today.AddDays(-7);

            var recentlyStudied = await _context.StudyLogs
                .Where(sl => sl.DateLogged >= weekAgo)
                .Select(sl => sl.StudentId)
                .Distinct()
                .ToListAsync();

            var hasActiveGoal = await _context.Goals
                .Where(g => !g.IsCompleted)
                .Select(g => g.StudentId)
                .Distinct()
                .ToListAsync();

            // INTERSECT
            var engagedIds = recentlyStudied.Intersect(hasActiveGoal).ToList();

            var students = await _context.Students
                .Where(s => engagedIds.Contains(s.StudentId))
                .Select(s => new { studentId = s.StudentId, name = s.Name, email = s.Email })
                .ToListAsync();

            return Ok(new { success = true, data = students });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch engaged students.", error = ex.Message });
        }
    }
}
