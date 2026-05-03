using Npgsql;

namespace StudySphere.Patterns.Singleton;

/// <summary>
/// Singleton Pattern — one shared database connection factory across all data-access
/// components. Uses double-check locking for thread safety.
/// </summary>
public sealed class DatabaseConnectionSingleton
{
    private static DatabaseConnectionSingleton? _instance;
    private static readonly object _lock = new();

    public string ConnectionString { get; }

    private DatabaseConnectionSingleton(string connectionString)
    {
        ConnectionString = connectionString;
    }

    /// <summary>
    /// Returns the single instance, creating it on the first call (double-check lock).
    /// </summary>
    public static DatabaseConnectionSingleton GetInstance(string connectionString)
    {
        if (_instance is null)
        {
            lock (_lock)
            {
                _instance ??= new DatabaseConnectionSingleton(connectionString);
            }
        }
        return _instance;
    }

    /// <summary>
    /// Creates and opens a new NpgsqlConnection using the singleton connection string.
    /// Caller is responsible for disposing.
    /// </summary>
    public async Task<NpgsqlConnection> CreateOpenConnectionAsync()
    {
        var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();
        return conn;
    }
}
