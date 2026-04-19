import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="not-found" data-testid="not-found">
            <div className="not-found__icon">🔍</div>
            <h2 className="not-found__title">Job not found</h2>
            <p className="not-found__message">The job you are looking for does not exist or has been removed.</p>
            <Link href="/jobs" className="btn btn--primary" data-testid="not-found-back">
                Back to Jobs
            </Link>
        </div>
    );
}