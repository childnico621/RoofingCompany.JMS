namespace JobTracker.Modules.Jobs.Application.Jobs;

public record JobResponse(
    Guid Id,
    string Title,
    string Description,
    string Status,
    DateTime? ScheduledDate,
    Guid? AssigneeId,
    Guid CustomerId,
    Guid OrganizationId,
    string Street,
    string City,
    string State,
    string ZipCode);

public record PagedList<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public bool HasNextPage => Page * PageSize < TotalCount;
    public bool HasPreviousPage => Page > 1;
}
