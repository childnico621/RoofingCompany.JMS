using FluentValidation;
using JobTracker.Modules.Jobs.Application.Common;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.SeedWork;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

public sealed record CompleteJobCommand(Guid JobId) : IRequest<Result<Unit>>;

internal sealed class CompleteJobValidator : AbstractValidator<CompleteJobCommand>
{
    public CompleteJobValidator()
    {
        RuleFor(x => x.JobId).NotEmpty();
    }
}

internal sealed class CompleteJobCommandHandler : IRequestHandler<CompleteJobCommand, Result<Unit>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteJobCommandHandler(IJobRepository jobRepository, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(CompleteJobCommand request, CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByIdAsync(request.JobId, cancellationToken);

        if (job == null)
        {
            return Result.Failure<Unit>("Job not found.");
        }

        try
        {
            job.Complete();
        }
        catch (DomainException ex)
        {
            return Result.Failure<Unit>(ex.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new Unit());
    }
}
