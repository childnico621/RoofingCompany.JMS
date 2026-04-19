using JobTracker.Modules.Jobs.Domain.SeedWork;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Newtonsoft.Json;

namespace JobTracker.Modules.Jobs.Infrastructure.Outbox;

public sealed class InsertOutboxMessagesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var dbContext = eventData.Context;

        if (dbContext is null)
        {
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        var outboxMessages = dbContext.ChangeTracker
            .Entries<Entity>()
            .Select(x => x.Entity)
            .SelectMany(aggregateRoot =>
            {
                var domainEvents = aggregateRoot.DomainEvents.ToList();
                var integrationEvents = aggregateRoot.IntegrationEvents.ToList();

                aggregateRoot.ClearDomainEvents();
                aggregateRoot.ClearIntegrationEvents();

                var allEvents = domainEvents.Cast<object>().Concat(integrationEvents).ToList();

                return allEvents;
            })
            .Select(eventItem => new OutboxMessage
            {
                Id = Guid.NewGuid(),
                OccurredOnUtc = DateTime.UtcNow,
                Type = eventItem.GetType().Name,
                Content = JsonConvert.SerializeObject(
                    eventItem,
                    new JsonSerializerSettings
                    {
                        TypeNameHandling = TypeNameHandling.All
                    })
            })
            .ToList();

        dbContext.Set<OutboxMessage>().AddRange(outboxMessages);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
