namespace StudySphere.Models;

public class Admin
{
    public int AdminId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
