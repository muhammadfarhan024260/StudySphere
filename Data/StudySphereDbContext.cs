using Microsoft.EntityFrameworkCore;
using StudySphere.Models;

namespace StudySphere.Data;

public class StudySphereDbContext : DbContext
{
    public StudySphereDbContext(DbContextOptions<StudySphereDbContext> options)
        : base(options)
    {
    }

    public override int SaveChanges()
    {
        NormalizeDateTimes();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        NormalizeDateTimes();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void NormalizeDateTimes()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State is not EntityState.Added and not EntityState.Modified)
            {
                continue;
            }

            foreach (var property in entry.Properties)
            {
                if (property.CurrentValue is DateTime dateTime)
                {
                    property.CurrentValue = EnsureUnspecified(dateTime);
                    continue;
                }

                if (property.CurrentValue is DateTime nullableDateTime)
                {
                    property.CurrentValue = EnsureUnspecified(nullableDateTime);
                }
            }
        }
    }

    private static DateTime EnsureUnspecified(DateTime value)
    {
        return value.Kind == DateTimeKind.Unspecified
            ? value
            : DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    // DbSets for authentication
    public DbSet<Student> Students { get; set; } = null!;
    public DbSet<Admin> Admins { get; set; } = null!;
    public DbSet<OtpVerification> OtpVerifications { get; set; } = null!;
    
    // DbSets for study management
    public DbSet<StudyLog> StudyLogs { get; set; } = null!;
    public DbSet<Goal> Goals { get; set; } = null!;
    public DbSet<Subject> Subjects { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure Student table
        modelBuilder.Entity<Student>()
            .ToTable("student")
            .HasKey(s => s.StudentId)
            .HasName("PK_student");

        modelBuilder.Entity<Student>()
            .Property(s => s.StudentId)
            .HasColumnName("student_id");

        modelBuilder.Entity<Student>()
            .Property(s => s.Email)
            .HasColumnName("email");

        modelBuilder.Entity<Student>()
            .Property(s => s.PasswordHash)
            .HasColumnName("password_hash");

        modelBuilder.Entity<Student>()
            .Property(s => s.Name)
            .HasColumnName("name");

        modelBuilder.Entity<Student>()
            .Property(s => s.EnrollmentNumber)
            .HasColumnName("enrollment_number");

        modelBuilder.Entity<Student>()
            .Property(s => s.CreatedDate)
            .HasColumnName("created_date");
        modelBuilder.Entity<Student>()
            .Property(s => s.CreatedDate)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Student>()
            .Property(s => s.LastLogin)
            .HasColumnName("last_login");
        modelBuilder.Entity<Student>()
            .Property(s => s.LastLogin)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Student>()
            .Property(s => s.IsActive)
            .HasColumnName("is_active");

        modelBuilder.Entity<Student>()
            .Property(s => s.UpdatedAt)
            .HasColumnName("updated_at");
        modelBuilder.Entity<Student>()
            .Property(s => s.UpdatedAt)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Student>()
            .HasIndex(s => s.Email)
            .IsUnique();

        // Configure Admin table
        modelBuilder.Entity<Admin>()
            .ToTable("admin")
            .HasKey(a => a.AdminId)
            .HasName("PK_admin");

        modelBuilder.Entity<Admin>()
            .Property(a => a.AdminId)
            .HasColumnName("admin_id");

        modelBuilder.Entity<Admin>()
            .Property(a => a.Email)
            .HasColumnName("email");

        modelBuilder.Entity<Admin>()
            .Property(a => a.PasswordHash)
            .HasColumnName("password_hash");

        modelBuilder.Entity<Admin>()
            .Property(a => a.Name)
            .HasColumnName("name");

        modelBuilder.Entity<Admin>()
            .Property(a => a.CreatedDate)
            .HasColumnName("created_date");
        modelBuilder.Entity<Admin>()
            .Property(a => a.CreatedDate)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Admin>()
            .Property(a => a.LastLogin)
            .HasColumnName("last_login");
        modelBuilder.Entity<Admin>()
            .Property(a => a.LastLogin)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Admin>()
            .Property(a => a.IsActive)
            .HasColumnName("is_active");

        modelBuilder.Entity<Admin>()
            .Property(a => a.UpdatedAt)
            .HasColumnName("updated_at");
        modelBuilder.Entity<Admin>()
            .Property(a => a.UpdatedAt)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Email)
            .IsUnique();

        // Configure OtpVerification table
        modelBuilder.Entity<OtpVerification>()
            .ToTable("otp_verification")
            .HasKey(o => o.OtpId)
            .HasName("PK_otp_verification");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.OtpId)
            .HasColumnName("otp_id");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.Email)
            .HasColumnName("email");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.OtpCode)
            .HasColumnName("otp_code");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.UserType)
            .HasColumnName("user_type");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.IsVerified)
            .HasColumnName("is_verified");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.CreatedDate)
            .HasColumnName("created_date");
        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.CreatedDate)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.ExpiryTime)
            .HasColumnName("expiry_time");
        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.ExpiryTime)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.VerificationDate)
            .HasColumnName("verification_date");
        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.VerificationDate)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.AttemptCount)
            .HasColumnName("attempt_count");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.IsUsed)
            .HasColumnName("is_used");

        modelBuilder.Entity<OtpVerification>()
            .HasIndex(o => new { o.Email, o.UserType })
            .IsUnique(false);

        // Configure StudyLog table
        modelBuilder.Entity<StudyLog>()
            .ToTable("study_log")
            .HasKey(sl => sl.LogId)
            .HasName("PK_study_log");

        modelBuilder.Entity<StudyLog>()
            .Property(sl => sl.LogId)
            .HasColumnName("log_id");

        // Configure Goal table
        modelBuilder.Entity<Goal>()
            .ToTable("goal")
            .HasKey(g => g.GoalId)
            .HasName("PK_goal");

        modelBuilder.Entity<Goal>()
            .Property(g => g.GoalId)
            .HasColumnName("goal_id");

        // Configure Subject table
        modelBuilder.Entity<Subject>()
            .ToTable("subject")
            .HasKey(s => s.SubjectId)
            .HasName("PK_subject");

        modelBuilder.Entity<Subject>()
            .Property(s => s.SubjectId)
            .HasColumnName("subject_id");
    }
}
