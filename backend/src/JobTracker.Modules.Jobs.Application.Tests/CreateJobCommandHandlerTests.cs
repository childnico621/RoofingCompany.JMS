using FluentAssertions;
using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using Moq;
using Xunit;

namespace JobTracker.Modules.Jobs.Application.Tests;

public class CreateJobCommandHandlerTests
{
    private readonly Mock<IJobRepository> _jobRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateJobCommandHandler _handler;

    public CreateJobCommandHandlerTests()
    {
        _jobRepositoryMock = new Mock<IJobRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateJobCommandHandler(_jobRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateJob_When_RequestIsValid()
    {
        var command = new CreateJobCommand(
            "Title", "Desc", "Street", "City", "ST", "12345", 0, 0, Guid.NewGuid(), Guid.NewGuid());

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _jobRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
