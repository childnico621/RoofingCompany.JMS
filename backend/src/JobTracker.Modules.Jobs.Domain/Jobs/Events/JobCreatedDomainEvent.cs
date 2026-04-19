using JobTracker.Modules.Jobs.Domain.SeedWork;

namespace JobTracker.Modules.Jobs.Domain.Jobs.Events;

public record JobCreatedDomainEvent(Guid JobId, Guid OrganizationId) : IDomainEvent
{
    public DateTime OccurredOn => DateTime.UtcNow;
}
