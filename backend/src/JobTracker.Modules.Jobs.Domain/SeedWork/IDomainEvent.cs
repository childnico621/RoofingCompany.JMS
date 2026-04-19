using MediatR;

namespace JobTracker.Modules.Jobs.Domain.SeedWork;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}
