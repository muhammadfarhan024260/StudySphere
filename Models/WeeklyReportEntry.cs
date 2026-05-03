namespace StudySphere.Models;

public class WeeklyReportEntry
{
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public DateTime WeekStart { get; set; }
    public int SessionCount { get; set; }
    public decimal TotalHours { get; set; }
    public decimal AvgProductivity { get; set; }
    public decimal MaxProductivity { get; set; }
}
