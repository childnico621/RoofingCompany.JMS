using JobTracker.Modules.Jobs.Application.Common;
using JobTracker.Modules.Jobs.Domain.Jobs;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

public sealed record SearchJobsQuery(
    Guid OrganizationId,
    JobStatus? Status = null,
    DateTime? From = null,
    DateTime? To = null,
    Guid? AssigneeId = null,
    int Page = 1,
    int PageSize = 10) : IRequest<Result<PagedList<JobResponse>>>;

internal sealed class SearchJobsQueryHandler : IRequestHandler<SearchJobsQuery, Result<PagedList<JobResponse>>>
{
    private readonly IJobRepository _jobRepository;

    public SearchJobsQueryHandler(IJobRepository jobRepository)
    {
        _jobRepository = jobRepository;
    }

    public async Task<Result<PagedList<JobResponse>>> Handle(SearchJobsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _jobRepository.SearchAsync(
            request.OrganizationId,
            request.Status,
            request.From,
            request.To,
            request.AssigneeId,
            request.Page,
            request.PageSize,
            cancellationToken);

        var responses = items.Select(job => new JobResponse(
            job.Id,
            job.Title,
            job.Description,
            job.Status.ToString(),
            job.ScheduledDate,
            job.AssigneeId,
            job.CustomerId,
            job.OrganizationId,
            job.Address.Street,
            job.Address.City,
            job.Address.State,
            job.Address.ZipCode)).ToList();

        return Result.Success(new PagedList<JobResponse>(responses, totalCount, request.Page, request.PageSize));
    }
}
