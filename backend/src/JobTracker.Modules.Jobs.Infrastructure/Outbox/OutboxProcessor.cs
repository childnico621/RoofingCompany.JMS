using JobTracker.Modules.Jobs.Domain.Jobs.Events;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace JobTracker.Modules.Jobs.Infrastructure.Outbox;

public sealed class OutboxProcessor
{
    private readonly JobsDbContext _dbContext;
    private readonly IPublisher _publisher;

    public OutboxProcessor(JobsDbContext dbContext, IPublisher publisher)
    {
        _dbContext = dbContext;
        _publisher = publisher;
    }

    public async Task ProcessAsync()
    {
        var messages = await _dbContext.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(20)
            .ToListAsync();

        foreach (var message in messages)
        {
            try
            {
                var domainEvent = JsonConvert.DeserializeObject<INotification>(
                    message.Content,
                    new JsonSerializerSettings
                    {
                        TypeNameHandling = TypeNameHandling.All
                    });

                if (domainEvent is null)
                {
                    continue;
                }

                await _publisher.Publish(domainEvent);

                message.ProcessedOnUtc = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                message.Error = ex.ToString();
            }
        }

        await _dbContext.SaveChangesAsync();
    }
}
