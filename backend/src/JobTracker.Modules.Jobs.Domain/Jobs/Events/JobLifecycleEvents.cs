using JobTracker.Modules.Jobs.Domain.SeedWork;

namespace JobTracker.Modules.Jobs.Domain.Jobs.Events;

public record JobCompletedDomainEvent(Guid JobId, Guid OrganizationId) : IDomainEvent
{
    public DateTime OccurredOn => DateTime.UtcNow;
}

public record JobCancelledDomainEvent(Guid JobId, Guid OrganizationId) : IDomainEvent
{
    public DateTime OccurredOn => DateTime.UtcNow;
}
