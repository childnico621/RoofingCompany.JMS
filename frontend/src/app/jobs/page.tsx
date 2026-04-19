import 'server-only';
import { Suspense } from 'react';
import JobsClient from '@/presentation/views/jobs';
import JobSkeleton from '@/presentation/views/jobs/components/atoms/job-skeleton.component';

import { getJobsAction } from './actions/get-jobs.action';

export default async function JobsPage() {
    const jobs = await getJobsAction();
    return (
        <Suspense fallback={<JobSkeleton />}>
            <JobsClient jobs={jobs} />
        </Suspense>
    );
}