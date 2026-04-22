namespace StudySphere.Models;

public class WeakArea
{
    public int WeakAreaId { get; set; }
    public int StudentId { get; set; }
    public int SubjectId { get; set; }
    public decimal AvgScore { get; set; }
    public DateTime DetectedDate { get; set; }

    // For JOIN results
    public string? SubjectName { get; set; }
}
