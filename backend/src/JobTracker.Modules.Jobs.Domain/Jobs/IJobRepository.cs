using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Job job, CancellationToken cancellationToken = default);
    // SearchAsync will be defined here too as requested
    Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        Guid organizationId,
        JobStatus? status,
        DateTime? from,
        DateTime? to,
        Guid? assigneeId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
