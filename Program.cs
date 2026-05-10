using System.Text;
using DotNetEnv;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.IdentityModel.Tokens;
using StudySphere.Data;
using StudySphere.Repositories;
using StudySphere.Services;
using StudySphere.Facades;
using StudySphere.Patterns.Singleton;
using StudySphere.Patterns.Decorator;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

// Npgsql 6+ rejects DateTime with Kind=Utc for "timestamp without time zone" columns.
// This switch restores the legacy behaviour so DateTime.UtcNow writes work unchanged.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Load .env only in local development (Render injects env vars directly)
if (File.Exists(".env"))
    Env.Load(".env");

var builder = WebApplication.CreateBuilder(args);

// Get connection string — from .env locally, from env var on Render
var connectionString = Environment.GetEnvironmentVariable("connection_string")
    ?? builder.Configuration["connection_string"];
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Environment variable 'connection_string' not set. Set it in Render dashboard (or .env locally).");
}

// Validate connection string format
// Accept both PostgreSQL URI format (postgresql://...) and .NET format (Host=...;Database=...;)
bool isValidFormat = connectionString.StartsWith("postgresql://") || 
                     (connectionString.Contains("Host=") && connectionString.Contains("Database="));

if (!isValidFormat)
{
    throw new InvalidOperationException(
        $"Invalid connection string format. Expected either:\n" +
        $"1. PostgreSQL URI: postgresql://user:password@host/database?params\n" +
        $"2. .NET format: Host=hostname;Database=dbname;Username=user;Password=pass;SSL Mode=Require;\n" +
        $"Got: {connectionString.Substring(0, Math.Min(50, connectionString.Length))}...");
}

// Firebase initialization — individual env vars to avoid base64/encoding corruption issues
var firebaseClientEmail = Environment.GetEnvironmentVariable("Firebase__ClientEmail");
var firebasePrivateKey  = Environment.GetEnvironmentVariable("Firebase__PrivateKey")?.Replace("\\n", "\n");
var firebaseProjectId   = Environment.GetEnvironmentVariable("Firebase__ProjectId");
if (!string.IsNullOrEmpty(firebaseClientEmail) && !string.IsNullOrEmpty(firebasePrivateKey)
    && FirebaseApp.DefaultInstance == null)
{
    try
    {
        var saCredential = new Google.Apis.Auth.OAuth2.ServiceAccountCredential(
            new Google.Apis.Auth.OAuth2.ServiceAccountCredential.Initializer(firebaseClientEmail)
            {
                ProjectId = firebaseProjectId
            }.FromPrivateKey(firebasePrivateKey)
        );
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromServiceAccountCredential(saCredential)
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Firebase] Init skipped: {ex.Message}");
    }
}

// Singleton Pattern — one shared DB connection factory for the lifetime of the app
var dbSingleton = DatabaseConnectionSingleton.GetInstance(connectionString);

// Read JWT config via IConfiguration so it works regardless of whether the .env file
// uses colon (JWT:Secret) or double-underscore (JWT__Secret) format.
var jwtSecret = builder.Configuration["JWT:Secret"] ?? "your-super-secret-jwt-key-minimum-32-characters-long-change-this";

// Add services to the container
builder.Services.AddDbContext<StudySphereDbContext>(options =>
{
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException("Connection string cannot be null or empty when configuring DbContext");
    }
    
    try
    {
        // Configure Npgsql with retry support for resilience
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(10), null);
        });
    }
    catch (Exception ex)
    {
        throw new InvalidOperationException(
            $"Failed to configure DbContext with connection string. Details: {ex.Message}\n" +
            $"Connection string: {connectionString}", ex);
    }
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"] ?? "StudySphere",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"] ?? "StudySphereUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

// Authorization
builder.Services.AddAuthorization();

// Data Access Layer - Repositories
builder.Services.AddScoped<IStudyLogRepository, StudyLogRepository>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IWeakAreaRepository, WeakAreaRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();

// Business Layer - Services
builder.Services.AddScoped<IStudyLogService, StudyLogService>();
builder.Services.AddScoped<IGoalService, GoalService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddHttpClient("resend");
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IIntelligenceService, IntelligenceService>();

// Façade Pattern
builder.Services.AddScoped<StudyPlannerFacade>();

// Singleton Pattern — register the already-created instance
builder.Services.AddSingleton(dbSingleton);

// Decorator Pattern — scoped because it holds scoped dependencies (IEmailService, IStudentRepository)
builder.Services.AddScoped<NotificationDeliveryService>();

// Add CORS policy for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Render handles HTTPS at the load balancer — skip redirect to avoid redirect loops
if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Add global exception handler
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An unhandled exception occurred: {ExceptionMessage}", ex.Message);
        
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 500;
        
        await context.Response.WriteAsJsonAsync(new
        {
            error = "An unexpected error occurred",
            details = ex.Message,
            stackTrace = ex.StackTrace
        });
    }
});

// Use CORS
app.UseCors("AllowFrontend");

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapControllers();

app.Run();

