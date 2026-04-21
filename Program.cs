using System.Text;
using DotNetEnv;
using Microsoft.IdentityModel.Tokens;
using StudySphere.Data;
using StudySphere.Repositories;
using StudySphere.Services;
using StudySphere.Facades;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

// Load environment variables from .env file
Env.Load(".env");

var builder = WebApplication.CreateBuilder(args);

// Get connection string from .env
var connectionString = Env.GetString("connection_string");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'connection_string' not found in .env file. Make sure .env file exists and contains: connection_string=postgresql://...");
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

var jwtSecret = Env.GetString("JWT__Secret") ?? "your-super-secret-jwt-key-minimum-32-characters-long-change-this";

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
        ValidIssuer = Env.GetString("JWT__Issuer") ?? "StudySphere",
        ValidateAudience = true,
        ValidAudience = Env.GetString("JWT__Audience") ?? "StudySphereUsers",
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

// Business Layer - Services
builder.Services.AddScoped<IStudyLogService, StudyLogService>();
builder.Services.AddScoped<IGoalService, GoalService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Façade Pattern
builder.Services.AddScoped<StudyPlannerFacade>();

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

app.MapControllers();

app.Run();

