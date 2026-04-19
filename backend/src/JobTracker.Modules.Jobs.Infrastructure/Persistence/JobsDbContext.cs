using JobTracker.Modules.Jobs.Application.Common;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using JobTracker.Modules.Jobs.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence;

public sealed class JobsDbContext : DbContext, IUnitOfWork
{
    private readonly ITenantProvider _tenantProvider;

    public JobsDbContext(DbContextOptions<JobsDbContext> options, ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public DbSet<Job> Jobs { get; set; }
    public DbSet<OutboxMessage> OutboxMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("jobs");

        modelBuilder.Entity<Job>(builder =>
        {
            builder.ToTable("jobs");
            builder.HasKey(j => j.Id);

            builder.Property(j => j.Status)
                .HasConversion<string>();

            builder.OwnsOne(j => j.Address, addressBuilder =>
            {
                addressBuilder.Property(a => a.Street).HasColumnName("street");
                addressBuilder.Property(a => a.City).HasColumnName("city");
                addressBuilder.Property(a => a.State).HasColumnName("state");
                addressBuilder.Property(a => a.ZipCode).HasColumnName("zip_code");
                addressBuilder.Property(a => a.Latitude).HasColumnName("latitude");
                addressBuilder.Property(a => a.Longitude).HasColumnName("longitude");
            });

            builder.HasMany(j => j.Photos)
                .WithOne()
                .HasForeignKey("job_id")
                .OnDelete(DeleteBehavior.Cascade);

            // Multi-Tenancy Global Query Filter
            builder.HasQueryFilter(j => j.OrganizationId == _tenantProvider.TenantId);
        });

        modelBuilder.Entity<JobPhoto>(builder =>
        {
            builder.ToTable("job_photos");
            builder.HasKey(p => p.Id);
        });

        modelBuilder.Entity<OutboxMessage>(builder =>
        {
            builder.ToTable("outbox_messages");
            builder.HasKey(m => m.Id);
        });
    }
}
