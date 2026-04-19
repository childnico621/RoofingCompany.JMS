using System.Collections.Concurrent;

namespace JobTracker.Modules.Jobs.Domain.SeedWork;

public abstract class Entity
{
    public Guid Id { get; protected set; }

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    private readonly List<object> _integrationEvents = new();
    public IReadOnlyCollection<object> IntegrationEvents => _integrationEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    protected void AddIntegrationEvent(object integrationEvent)
    {
        _integrationEvents.Add(integrationEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    public void ClearIntegrationEvents()
    {
        _integrationEvents.Clear();
    }
}

public abstract class AggregateRoot : Entity
{
}
