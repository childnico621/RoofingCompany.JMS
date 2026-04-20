using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Register Jobs Module
builder.Services.AddJobsModule(builder.Configuration);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<JobTracker.Modules.Jobs.Infrastructure.Persistence.JobsDbContext>();
    // In a real app we would use Migrate(), but for this assessment EnsureCreated is safer
    await context.Database.EnsureCreatedAsync();

    if (!context.Jobs.Any())
    {
        var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var customerId = Guid.NewGuid();
        var assigneeId = Guid.NewGuid();

        var jobs = new List<JobTracker.Modules.Jobs.Domain.Jobs.Job>
        {
            JobTracker.Modules.Jobs.Domain.Jobs.Job.Create("Roof Inspection - Central Park", "Initial assessment", 
                new JobTracker.Modules.Jobs.Domain.Jobs.Address("123 Central Park S", "New York", "NY", "10019"), customerId, tenantId),
            
            JobTracker.Modules.Jobs.Domain.Jobs.Job.Create("Emergency Patch - Brooklyn", "Repair leak", 
                new JobTracker.Modules.Jobs.Domain.Jobs.Address("456 Atlantic Ave", "Brooklyn", "NY", "11217"), customerId, tenantId),
            
            JobTracker.Modules.Jobs.Domain.Jobs.Job.Create("Full Replacement - Queens", "Complete shingle replacement", 
                new JobTracker.Modules.Jobs.Domain.Jobs.Address("789 Broadway", "LIC", "NY", "11101"), customerId, tenantId),
            
            JobTracker.Modules.Jobs.Domain.Jobs.Job.Create("Gutter Cleaning - Bronx", "Annual maintenance", 
                new JobTracker.Modules.Jobs.Domain.Jobs.Address("101 Grand Concourse", "Bronx", "NY", "10451"), customerId, tenantId),
            
            JobTracker.Modules.Jobs.Domain.Jobs.Job.Create("Shingle Repair - Staten Island", "Minor repair", 
                new JobTracker.Modules.Jobs.Domain.Jobs.Address("202 Victory Blvd", "SI", "NY", "10301"), customerId, tenantId)
        };

        // Transition states
        jobs[1].Schedule(DateTime.UtcNow.AddDays(7), assigneeId);
        
        jobs[2].Schedule(DateTime.UtcNow.AddDays(1), assigneeId);
        jobs[2].Start();

        jobs[3].Schedule(DateTime.UtcNow.AddDays(-10), assigneeId);
        jobs[3].Start();
        jobs[3].Complete();

        jobs[4].Cancel();

        context.Jobs.AddRange(jobs);
        await context.SaveChangesAsync();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

// app.UseHttpsRedirection(); // Disabled for local development in Docker

// --- Jobs Endpoints ---

app.MapGet("/api/jobs", async (IMediator mediator, 
    [FromHeader(Name = "X-Tenant-Id")] Guid? tenantId,
    [FromQuery] int page = 1, 
    [FromQuery] int pageSize = 10) =>
{
    var effectiveTenantId = tenantId ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
    var query = new SearchJobsQuery(effectiveTenantId, Page: page, PageSize: pageSize);
    var result = await mediator.Send(query);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("SearchJobs");

app.MapPost("/api/jobs", async (IMediator mediator, 
    [FromBody] CreateJobRequest request,
    [FromHeader(Name = "X-Tenant-Id")] Guid? tenantId) =>
{
    var effectiveTenantId = tenantId ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
    
    var command = new CreateJobCommand(
        request.Title,
        request.Description,
        request.Street ?? "N/A",
        request.City ?? "N/A",
        request.State ?? "N/A",
        request.ZipCode ?? "N/A",
        request.Latitude ?? 0,
        request.Longitude ?? 0,
        request.CustomerId ?? Guid.NewGuid(),
        effectiveTenantId
    );

    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Created($"/api/jobs/{result.Value}", result.Value) : Results.BadRequest(result.Error);
})
.WithName("CreateJob");

app.Run();

// DTOs for Minimal API
public record CreateJobRequest(
    string Title, 
    string Description, 
    string? Street, 
    string? City, 
    string? State, 
    string? ZipCode, 
    double? Latitude, 
    double? Longitude, 
    Guid? CustomerId);
