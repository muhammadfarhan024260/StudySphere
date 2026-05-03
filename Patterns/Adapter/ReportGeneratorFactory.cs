namespace StudySphere.Patterns.Adapter;

/// <summary>
/// Factory that creates the correct IReportGenerator adapter for a given format string.
/// </summary>
public static class ReportGeneratorFactory
{
    public static IReportGenerator Create(string format) => format.ToLower() switch
    {
        "csv"  => new CsvReportAdapter(),
        "json" => new JsonReportAdapter(),
        _      => throw new ArgumentException($"Unsupported format '{format}'. Supported: csv, json")
    };
}
