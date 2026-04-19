import { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectFilteredJobs } from '@/entities/job/model/job.selectors';
import { useCreateJob } from '../features/create-job';
import { useFilterJobs } from '../features/filter-jobs';
import { useCompleteJob } from '../features/complete-job';
import type { Job } from '@/entities/job/model/job.types';

export type { Job };

export function useJobsPage(serverJobs: Job[]) {
    const [localJobs, setLocalJobs] = useState<Job[]>(serverJobs);

    const selectFilteredJobs = useMemo(
        () => makeSelectFilteredJobs(localJobs),
        [localJobs]
    );

    const filteredJobs = useSelector(selectFilteredJobs);

    const createJob = useCreateJob({
        onSuccess: (newJob) => {
            setLocalJobs(prev => [...prev, newJob]);
        },
    });

    const filterJobs = useFilterJobs();

    const completeJob = useCompleteJob({
        onSuccess: (jobId) => {
            setLocalJobs(prev =>
                prev.map(j => (j.id === jobId ? { ...j, status: 'Completed' } : j))
            );
        },
    });

    const canCompleteJob = useCallback(
        (status: string) => status === 'InProgress',
        []
    );

    return {
        filteredJobs,
        hasJobs: filteredJobs.length > 0,
        createJob,
        filterJobs,
        completeJob,
        canCompleteJob,
    };
}