namespace StudySphere.Patterns.Adapter;

/// <summary>
/// Adapter Pattern — target interface. Both CSV and JSON adapters implement this,
/// letting the controller work with any format without knowing the details.
/// </summary>
public interface IReportGenerator
{
    string FormatName { get; }
    string ContentType { get; }
    string FileExtension { get; }
    byte[] Generate(ReportData data);
}
