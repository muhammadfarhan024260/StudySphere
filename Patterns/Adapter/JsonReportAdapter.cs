using System.Text;
using System.Text.Json;

namespace StudySphere.Patterns.Adapter;

/// <summary>
/// Adapter Pattern — adapts ReportData to formatted JSON.
/// </summary>
public class JsonReportAdapter : IReportGenerator
{
    public string FormatName    => "JSON";
    public string ContentType   => "application/json";
    public string FileExtension => "json";

    private static readonly JsonSerializerOptions _opts = new() { WriteIndented = true };

    public byte[] Generate(ReportData data)
    {
        var report = new
        {
            reportTitle  = "StudySphere Analytics Report",
            generatedAt  = data.GeneratedAt,
            summary = new
            {
                totalStudents    = data.TotalStudents,
                activeStudents   = data.ActiveStudents,
                totalSessions    = data.TotalSessions,
                avgProductivity  = data.AvgProductivity
            },
            topSubjects = data.TopSubjects.Select(s => new
            {
                subject        = s.SubjectName,
                sessions       = s.Sessions,
                totalHours     = s.TotalHours,
                avgProductivity = s.AvgProductivity
            }),
            weeklyStats = data.WeeklyStats.Select(w => new
            {
                day   = w.Day,
                hours = w.Hours
            })
        };

        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(report, _opts));
    }
}
