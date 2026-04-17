using Microsoft.EntityFrameworkCore;

namespace StudySphere.Data;

public class StudySphereDbContext : DbContext
{
    public StudySphereDbContext(DbContextOptions<StudySphereDbContext> options)
        : base(options)
    {
    }

    // Add your DbSets here as you define your entities
    // Example:
    // public DbSet<Student> Students { get; set; }
    // public DbSet<Course> Courses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Add your entity configurations here
    }
}
