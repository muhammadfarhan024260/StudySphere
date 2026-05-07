using System.ComponentModel.DataAnnotations.Schema;

namespace StudySphere.Models;

public class StudyLog
{
    public int LogId { get; set; }
    public int StudentId { get; set; }
    public int SubjectId { get; set; }
    public decimal HoursStudied { get; set; }
    public int ProductivityScore { get; set; }
    public DateTime DateLogged { get; set; } = DateTime.Now;
    public string? Notes { get; set; }

    // Accepted from client payload; overrides DateLogged before save. Not persisted as a separate column.
    [NotMapped]
    public DateTime? SessionDate { get; set; }

    // For JOIN results
    public string? SubjectName { get; set; }
}
