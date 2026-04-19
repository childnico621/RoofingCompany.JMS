export default function JobSkeleton() {
    return (
        <div className="jobs-skeleton" role="status" aria-label="Loading jobs..." data-testid="jobs-skeleton">
            <div className="skeleton-header">
                <div className="skeleton-bar skeleton-bar--title" />
                <div className="skeleton-bar skeleton-bar--button" />
            </div>
            <div className="skeleton-filter">
                <div className="skeleton-bar skeleton-bar--filter" />
                <div className="skeleton-bar skeleton-bar--filter" />
            </div>
            <div className="skeleton-table">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-row">
                        <div className="skeleton-cell skeleton-cell--title" />
                        <div className="skeleton-cell skeleton-cell--status" />
                        <div className="skeleton-cell skeleton-cell--action" />
                    </div>
                ))}
            </div>
        </div>
    );
}
