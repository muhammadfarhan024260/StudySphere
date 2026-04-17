namespace StudySphere.Models;

public class Goal
{
    public int GoalId { get; set; }
    public int StudentId { get; set; }
    public int SubjectId { get; set; }
    public string GoalType { get; set; } = "weekly"; // weekly/monthly
    public decimal TargetHours { get; set; }
    public DateTime Deadline { get; set; }
    public bool IsCompleted { get; set; }
}
