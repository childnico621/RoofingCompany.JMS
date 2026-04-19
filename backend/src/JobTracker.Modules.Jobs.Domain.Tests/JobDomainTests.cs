using FluentAssertions;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Jobs.Events;
using Xunit;

namespace JobTracker.Modules.Jobs.Domain.Tests;

public class JobTests
{
    private readonly Address _address = new("123 Main St", "City", "ST", "12345", 0, 0);
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly Guid _organizationId = Guid.NewGuid();

    [Fact]
    public void Create_Should_CreateJobAndRaiseEvent()
    {
        var job = Job.Create("Title", "Desc", _address, _customerId, _organizationId);

        job.Should().NotBeNull();
        job.Status.Should().Be(JobStatus.Draft);
        job.DomainEvents.Should().ContainSingle(e => e is JobCreatedDomainEvent);
    }

    [Fact]
    public void Schedule_Should_ThrowException_When_DateIsInPast()
    {
        var job = Job.Create("Title", "Desc", _address, _customerId, _organizationId);
        var pastDate = DateTime.UtcNow.AddDays(-1);

        var action = () => job.Schedule(pastDate, Guid.NewGuid());

        action.Should().Throw<DomainException>().WithMessage("A Job cannot be scheduled in the past.");
    }

    [Fact]
    public void Start_Should_ThrowException_When_NotScheduled()
    {
        var job = Job.Create("Title", "Desc", _address, _customerId, _organizationId);

        var action = () => job.Start();

        action.Should().Throw<DomainException>().WithMessage("Only Scheduled jobs can move to InProgress.");
    }

    [Fact]
    public void Complete_Should_TransitionStatusAndRaiseEvents()
    {
        var job = Job.Create("Title", "Desc", _address, _customerId, _organizationId);
        job.Schedule(DateTime.UtcNow.AddDays(1), Guid.NewGuid());
        job.Start();

        job.Complete();

        job.Status.Should().Be(JobStatus.Completed);
        job.DomainEvents.Should().Contain(e => e is JobCompletedDomainEvent);
    }
}

public class AddressTests
{
    [Fact]
    public void Address_Equality_Should_BeStructural()
    {
        var addr1 = new Address("123 Main St", "City", "ST", "12345", 1.0, 2.0);
        var addr2 = new Address("123 Main St", "City", "ST", "12345", 1.0, 2.0);
        var addr3 = new Address("Different", "City", "ST", "12345", 1.0, 2.0);

        addr1.Should().Be(addr2);
        addr1.Should().NotBe(addr3);
        (addr1 == addr2).Should().BeTrue();
    }
}
