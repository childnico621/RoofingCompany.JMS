import React from 'react';

type ErrorBoundaryProps = { children: React.ReactNode; fallback?: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => this.setState({ hasError: false, error: null });

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="error-boundary" data-testid="error-boundary-fallback">
                    <div className="error-boundary__icon">⚠️</div>
                    <h3 className="error-boundary__title">Something went wrong</h3>
                    <p className="error-boundary__message">{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
                    <button className="btn btn--secondary" onClick={this.handleReset} data-testid="error-boundary-retry">
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
