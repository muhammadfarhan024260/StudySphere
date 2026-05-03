namespace StudySphere.Patterns.Adapter;

public class ReportData
{
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public int TotalSessions { get; set; }
    public double AvgProductivity { get; set; }
    public List<SubjectSummaryRow> TopSubjects { get; set; } = new();
    public List<WeeklyStatRow> WeeklyStats { get; set; } = new();
}

public class SubjectSummaryRow
{
    public string SubjectName { get; set; } = string.Empty;
    public int Sessions { get; set; }
    public double TotalHours { get; set; }
    public double AvgProductivity { get; set; }
}

public class WeeklyStatRow
{
    public string Day { get; set; } = string.Empty;
    public double Hours { get; set; }
}
