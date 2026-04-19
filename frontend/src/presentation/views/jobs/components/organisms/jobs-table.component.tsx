'use client';

import type { Job } from '@/entities/job/model/job.types';
import { getJobSummary, mapStatusToJobState } from '@/entities/job/model/job.utils';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    Draft: { label: 'Draft', className: 'badge badge--draft' },
    Scheduled: { label: 'Scheduled', className: 'badge badge--scheduled' },
    InProgress: { label: 'In Progress', className: 'badge badge--in-progress' },
    Completed: { label: 'Completed', className: 'badge badge--completed' },
    Cancelled: { label: 'Cancelled', className: 'badge badge--cancelled' },
};

type JobsTableProps = {
    jobs: Job[];
    onCompleteJob: (jobId: string, status: string) => void;
    canCompleteJob: (status: string) => boolean;
};

export default function JobsTable({ jobs, onCompleteJob, canCompleteJob }: JobsTableProps) {
    const statusMeta = (status: string) =>
        STATUS_LABELS[status] ?? { label: status, className: 'badge badge--unknown' };

    return jobs.length === 0 ? (
        <div className="jobs-empty" data-testid="jobs-empty">
            <p className="jobs-empty__text">No jobs match your filters.</p>
        </div>
    ) : (
        <div className="table-wrapper" data-testid="jobs-table">
            <table className="table" aria-label="Jobs list">
                <thead>
                    <tr className="table__header-row">
                        <th className="table__th" scope="col">Title</th>
                        <th className="table__th" scope="col">Status</th>
                        <th className="table__th table__th--actions" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map(job => {
                        const meta = statusMeta(job.status);
                        const summary = getJobSummary(mapStatusToJobState(job.status));
                        return (
                            <tr
                                key={job.id}
                                className="table__row"
                                data-testid={`job-row-${job.id}`}
                                aria-label={summary}
                            >
                                <td className="table__td table__td--title" data-testid={`job-title-${job.id}`}>
                                    {job.title}
                                </td>
                                <td className="table__td">
                                    <span className={meta.className} data-testid={`job-status-${job.id}`}>
                                        {meta.label}
                                    </span>
                                </td>
                                <td className="table__td table__td--actions">
                                    {canCompleteJob(job.status) ? (
                                        <button
                                            className="btn btn--sm btn--success"
                                            onClick={() => onCompleteJob(job.id, job.status)}
                                            data-testid={`complete-job-btn-${job.id}`}
                                            aria-label={`Complete job: ${job.title}`}
                                        >
                                            Complete
                                        </button>
                                    ) : (
                                        <span className="table__no-action">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
