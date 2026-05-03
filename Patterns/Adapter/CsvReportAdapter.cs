using System.Text;

namespace StudySphere.Patterns.Adapter;

/// <summary>
/// Adapter Pattern — adapts ReportData to CSV format.
/// </summary>
public class CsvReportAdapter : IReportGenerator
{
    public string FormatName    => "CSV";
    public string ContentType   => "text/csv";
    public string FileExtension => "csv";

    public byte[] Generate(ReportData data)
    {
        var sb = new StringBuilder();

        sb.AppendLine("StudySphere Analytics Report");
        sb.AppendLine($"Generated At,\"{data.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC\"");
        sb.AppendLine();

        sb.AppendLine("Summary Statistics");
        sb.AppendLine("Metric,Value");
        sb.AppendLine($"Total Students,{data.TotalStudents}");
        sb.AppendLine($"Active Students,{data.ActiveStudents}");
        sb.AppendLine($"Total Study Sessions,{data.TotalSessions}");
        sb.AppendLine($"Average Productivity Score,{data.AvgProductivity}");
        sb.AppendLine();

        if (data.TopSubjects.Any())
        {
            sb.AppendLine("Subject Performance (Top 10)");
            sb.AppendLine("Subject,Sessions,Total Hours,Avg Productivity");
            foreach (var s in data.TopSubjects)
                sb.AppendLine($"\"{s.SubjectName}\",{s.Sessions},{s.TotalHours:F2},{s.AvgProductivity:F1}");
            sb.AppendLine();
        }

        if (data.WeeklyStats.Any())
        {
            sb.AppendLine("Weekly Hours (Last 7 Days)");
            sb.AppendLine("Day,Hours Studied");
            foreach (var w in data.WeeklyStats)
                sb.AppendLine($"{w.Day},{w.Hours:F1}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
