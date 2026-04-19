using JobTracker.Modules.Jobs.Domain.SeedWork;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public class JobPhoto : Entity
{
    public string Url { get; private set; }
    public DateTime CapturedAt { get; private set; }
    public string Caption { get; private set; }

    internal JobPhoto(string url, DateTime capturedAt, string caption)
    {
        Id = Guid.NewGuid();
        Url = url;
        CapturedAt = capturedAt;
        Caption = caption;
    }

    // Required by EF Core
    private JobPhoto() { }
}
