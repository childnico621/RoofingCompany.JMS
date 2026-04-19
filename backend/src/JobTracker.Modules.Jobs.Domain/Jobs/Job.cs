using JobTracker.Modules.Jobs.Domain.Jobs.Events;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using JobTracker.Modules.Jobs.IntegrationEvents;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public class Job : AggregateRoot
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public Address Address { get; private set; }
    public JobStatus Status { get; private set; }
    public DateTime? ScheduledDate { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid OrganizationId { get; private set; }

    private readonly List<JobPhoto> _photos = new();
    public IReadOnlyCollection<JobPhoto> Photos => _photos.AsReadOnly();

    public static Job Create(
        string title, 
        string description, 
        Address address, 
        Guid customerId, 
        Guid organizationId)
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            Address = address,
            Status = JobStatus.Draft,
            CustomerId = customerId,
            OrganizationId = organizationId
        };

        job.AddDomainEvent(new JobCreatedDomainEvent(job.Id, job.OrganizationId));

        return job;
    }

    public void Schedule(DateTime scheduledDate, Guid assigneeId)
    {
        if (scheduledDate < DateTime.UtcNow)
        {
            throw new DomainException("A Job cannot be scheduled in the past.");
        }

        if (Status == JobStatus.Completed || Status == JobStatus.Cancelled)
        {
            throw new DomainException("A Job cannot transition from Completed/Cancelled to any other state.");
        }

        ScheduledDate = scheduledDate;
        AssigneeId = assigneeId;
        Status = JobStatus.Scheduled;
    }

    public void Start()
    {
        if (Status != JobStatus.Scheduled)
        {
            throw new DomainException("Only Scheduled jobs can move to InProgress.");
        }

        Status = JobStatus.InProgress;
    }

    public void Complete()
    {
        if (Status == JobStatus.Completed || Status == JobStatus.Cancelled)
        {
            throw new DomainException("A Job cannot transition from Completed/Cancelled to any other state.");
        }

        Status = JobStatus.Completed;
        AddDomainEvent(new JobCompletedDomainEvent(Id, OrganizationId));
        AddIntegrationEvent(new JobCompletedIntegrationEvent(Guid.NewGuid(), DateTime.UtcNow, Id, OrganizationId));
    }

    public void Cancel()
    {
        if (Status == JobStatus.Completed || Status == JobStatus.Cancelled)
        {
            throw new DomainException("A Job cannot transition from Completed/Cancelled to any other state.");
        }

        Status = JobStatus.Cancelled;
        AddDomainEvent(new JobCancelledDomainEvent(Id, OrganizationId));
    }

    public void AddPhoto(string url, string caption)
    {
        if (Status == JobStatus.Completed || Status == JobStatus.Cancelled)
        {
            throw new DomainException("Cannot add photos to a completed or cancelled job.");
        }

        _photos.Add(new JobPhoto(url, DateTime.UtcNow, caption));
    }

    // Required by EF Core
    private Job() { }
}

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}
