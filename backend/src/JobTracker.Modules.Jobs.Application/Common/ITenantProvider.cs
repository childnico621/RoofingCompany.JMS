namespace JobTracker.Modules.Jobs.Application.Common;

public interface ITenantProvider
{
    Guid TenantId { get; }
}
