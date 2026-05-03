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

    // Not mapped to DB — enriched in-memory by GoalRepository
    public string SubjectName { get; set; } = string.Empty;

    // Computed fields serialized to JSON for the frontend
    public string Title => !string.IsNullOrEmpty(SubjectName)
        ? $"{SubjectName} ({char.ToUpper(GoalType[0]) + GoalType[1..]})"
        : char.ToUpper(GoalType[0]) + GoalType[1..];

    public string Status => IsCompleted ? "Completed" : "In Progress";
}
