using FluentValidation;
using JobTracker.Modules.Jobs.Application.Common;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CreateJob;

public sealed record CreateJobCommand(
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    double Latitude,
    double Longitude,
    Guid CustomerId,
    Guid OrganizationId) : IRequest<Result<Guid>>;

internal sealed class CreateJobValidator : AbstractValidator<CreateJobCommand>
{
    public CreateJobValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Street).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.ZipCode).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.OrganizationId).NotEmpty();
    }
}

internal sealed class CreateJobCommandHandler : IRequestHandler<CreateJobCommand, Result<Guid>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJobCommandHandler(IJobRepository jobRepository, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateJobCommand request, CancellationToken cancellationToken)
    {
        var address = new Address(
            request.Street,
            request.City,
            request.State,
            request.ZipCode,
            request.Latitude,
            request.Longitude);

        var job = Job.Create(
            request.Title,
            request.Description,
            address,
            request.CustomerId,
            request.OrganizationId);

        await _jobRepository.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(job.Id);
    }
}
