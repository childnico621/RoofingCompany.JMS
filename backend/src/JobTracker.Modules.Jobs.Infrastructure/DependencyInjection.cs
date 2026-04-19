using JobTracker.Modules.Jobs.Application.Common;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.Modules.Jobs.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddJobsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database");

        services.AddDbContext<JobsDbContext>(options =>
            options.UseNpgsql(connectionString)
                   .UseSnakeCaseNamingConvention());

        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<JobsDbContext>());
        services.AddScoped<ITenantProvider, HttpTenantProvider>();
        services.AddHttpContextAccessor();

        // Register MediatR from the Application assembly
        services.AddMediatR(cfg => 
        {
            cfg.RegisterServicesFromAssembly(typeof(Application.Jobs.CreateJob.CreateJobCommand).Assembly);
        });

        return services;
    }
}
