namespace StudySphere.Models;

public class Notification
{
    public int NotificationId { get; set; }
    public int StudentId { get; set; }
    public int? RelatedSubjectId { get; set; }
    public string Type { get; set; } = "weak_area";
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
}
