using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Repositories;

public sealed class JobRepository : IJobRepository
{
    private readonly JobsDbContext _context;

    public JobRepository(JobsDbContext context)
    {
        _context = context;
    }

    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Jobs
            .Include(j => j.Photos)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);
    }

    public async Task AddAsync(Job job, CancellationToken cancellationToken = default)
    {
        await _context.Jobs.AddAsync(job, cancellationToken);
    }

    public async Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        Guid organizationId,
        JobStatus? status,
        DateTime? from,
        DateTime? to,
        Guid? assigneeId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Jobs
            .AsNoTracking()
            .Where(j => j.OrganizationId == organizationId);

        if (status.HasValue)
        {
            query = query.Where(j => j.Status == status.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(j => j.ScheduledDate >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(j => j.ScheduledDate <= to.Value);
        }

        if (assigneeId.HasValue)
        {
            query = query.Where(j => j.AssigneeId == assigneeId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(j => j.ScheduledDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
