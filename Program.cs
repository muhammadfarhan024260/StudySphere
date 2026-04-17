using DotNetEnv;
using StudySphere.Data;
using StudySphere.Repositories;
using StudySphere.Services;
using StudySphere.Facades;
using Microsoft.EntityFrameworkCore;

// Load environment variables from .env file
Env.Load(".env");

var builder = WebApplication.CreateBuilder(args);

// Get connection string from .env
var connectionString = Env.GetString("connection_string");

// Add services to the container
builder.Services.AddDbContext<StudySphereDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Data Access Layer
builder.Services.AddScoped<IStudyLogRepository, StudyLogRepository>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();

// Business Layer
builder.Services.AddScoped<IStudyLogService, StudyLogService>();
builder.Services.AddScoped<IGoalService, GoalService>();

// Façade Pattern
builder.Services.AddScoped<StudyPlannerFacade>();

// Add CORS if needed for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
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
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
