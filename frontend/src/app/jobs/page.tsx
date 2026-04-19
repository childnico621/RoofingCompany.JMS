import 'server-only';
import { Suspense } from 'react';
import JobsClient from '@/presentation/views/jobs';
import JobSkeleton from '@/presentation/views/jobs/components/atoms/job-skeleton.component';

async function getJobsUseCase() {
    return [
        { id: '1', title: 'Roof Repair — 123 Main St', status: 'Scheduled' },
        { id: '2', title: 'Tile Installation — 456 Oak Ave', status: 'InProgress' },
        { id: '3', title: 'Gutter Replacement — 789 Elm Rd', status: 'Draft' },
        { id: '4', title: 'Inspection — 321 Pine Blvd', status: 'Completed' },
    ];
}

export default async function JobsPage() {
    const jobs = await getJobsUseCase();
    return (
        <Suspense fallback={<JobSkeleton />}>
            <JobsClient jobs={jobs} />
        </Suspense>
    );
}