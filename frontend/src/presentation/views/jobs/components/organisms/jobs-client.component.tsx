'use client';

import type { Job } from '@/entities/job/model/job.types';
import { useJobsPage } from '../../hooks/use-jobs-page.hook';
import FilterBar from '../../features/filter-jobs/components/molecules/job-filter-bar.component';
import CreateJobModal from '../../features/create-job/components/organisms/create-job-modal.component';
import CompleteJobModal from '../../features/complete-job/components/organisms/complete-job-modal.component';
import JobsTable from './jobs-table.component';
import { ErrorBoundary } from './error-boundary.component';

export default function JobsClient({ jobs }: { jobs: Job[] }) {
    const { filteredJobs, createJob, filterJobs, completeJob, canCompleteJob } = useJobsPage(jobs);

    return (
        <div className="jobs-page" data-testid="jobs-page">
            <div className="jobs-page__header">
                <h1 className="jobs-page__title">Jobs</h1>
                <button
                    className="btn btn--primary"
                    onClick={createJob.openModal}
                    data-testid="open-create-job"
                    aria-label="Create new job"
                >
                    + New Job
                </button>
            </div>

            <FilterBar onReset={filterJobs.handleReset}>
                <FilterBar.Status value={filterJobs.filters.status} onChange={filterJobs.handleStatusChange} />
                <FilterBar.Search value={filterJobs.filters.search} onChange={filterJobs.handleSearchChange} />
                <FilterBar.Reset />
            </FilterBar>

            <ErrorBoundary>
                <JobsTable
                    jobs={filteredJobs}
                    onCompleteJob={(jobId, status) => completeJob.openModal(jobId, status)}
                    canCompleteJob={canCompleteJob}
                />
            </ErrorBoundary>

            <CreateJobModal
                isOpen={createJob.isOpen}
                isSubmitting={createJob.isSubmitting}
                error={createJob.error}
                fields={createJob.fields}
                onClose={createJob.closeModal}
                onSubmit={createJob.handleSubmit}
                onFieldChange={createJob.setField}
            />

            <CompleteJobModal
                isOpen={completeJob.isOpen}
                isSubmitting={completeJob.isSubmitting}
                signatureUrl={completeJob.signatureUrl}
                error={completeJob.error}
                onClose={completeJob.closeModal}
                onSubmit={completeJob.handleSubmit}
                onSignatureChange={completeJob.setSignature}
            />
        </div>
    );
}