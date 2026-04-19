import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/providers/store';
import { setFilters } from '@/entities/job/model/job.slice';
import { selectFilters } from '@/entities/job/model/job.selectors';
import { type JobStatus } from '@/entities/job/model/job.types';

export function useFilterJobs() {
    const dispatch = useDispatch<AppDispatch>();
    const filters = useSelector(selectFilters);

    const handleStatusChange = useCallback(
        (status: JobStatus | undefined) => {
            dispatch(setFilters({ ...filters, status }));
        },
        [dispatch, filters]
    );

    const handleSearchChange = useCallback(
        (search: string) => {
            dispatch(setFilters({ ...filters, search: search || undefined }));
        },
        [dispatch, filters]
    );

    const handleReset = useCallback(() => {
        dispatch(setFilters({}));
    }, [dispatch]);

    return { filters, handleStatusChange, handleSearchChange, handleReset };
}
