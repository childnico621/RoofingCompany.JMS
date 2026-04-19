namespace JobTracker.Modules.Jobs.Domain.Jobs;

public enum JobStatus
{
    Draft,
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}
