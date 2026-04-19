'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="route-error" data-testid="route-error" role="alert">
            <div className="route-error__icon">🚧</div>
            <h2 className="route-error__title">Failed to load jobs</h2>
            <p className="route-error__message">
                {error.message ? error.message : 'An unexpected error occurred. Please try again.'}
            </p>
            {error.digest ? <p className="route-error__digest">Error ID: {error.digest}</p> : null}
            <button className="btn btn--primary" onClick={() => reset()} data-testid="error-retry-button">
                Try again
            </button>
        </div>
    );
}