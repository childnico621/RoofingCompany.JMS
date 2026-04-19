using JobTracker.Modules.Jobs.Application.Common;
using Microsoft.AspNetCore.Http;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence;

public sealed class HttpTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    // Default tenant for the assessment if not provided in header
    private static readonly Guid DefaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public HttpTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            var header = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Id"].ToString();
            if (Guid.TryParse(header, out var tenantId))
            {
                return tenantId;
            }
            return DefaultTenantId;
        }
    }
}
