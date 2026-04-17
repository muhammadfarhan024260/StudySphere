namespace StudySphere.Models;

public class Subject
{
    public int SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public decimal? TargetHours { get; set; }
}
