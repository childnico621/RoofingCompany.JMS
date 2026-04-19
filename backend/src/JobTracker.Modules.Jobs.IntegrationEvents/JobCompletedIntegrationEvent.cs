namespace JobTracker.Modules.Jobs.IntegrationEvents;

public record JobCompletedIntegrationEvent(
    Guid Id,
    DateTime OccurredOn,
    Guid JobId,
    Guid OrganizationId);
