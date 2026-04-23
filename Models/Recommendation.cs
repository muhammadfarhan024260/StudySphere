namespace StudySphere.Models;

public class Recommendation
{
    public int RecommendationId { get; set; }
    public int SubjectId { get; set; }
    public int AdminId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int MinScoreThreshold { get; set; } = 50;
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    // For JOIN results
    public string? SubjectName { get; set; }
    public string? AuthoredBy { get; set; }
}
