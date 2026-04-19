import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/app/providers/store';
import { Job } from './job.types';

export const selectJobUI = (state: RootState) => state.job;
export const selectFilters = (state: RootState) => state.job.filters;
export const selectSort = (state: RootState) => state.job.sort;
export const selectOptimisticUpdates = (state: RootState) => state.job.optimisticUpdates;

export const makeSelectFilteredJobs = (jobs: Job[]) =>
    createSelector(
        [selectFilters, selectSort, selectOptimisticUpdates],
        (filters, sort, optimistic) => {
            let result = jobs.map(job => ({ ...job, ...optimistic[job.id] }));

            result = result.filter(job => {
                if (filters.status && job.status !== filters.status) return false;
                if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
                return true;
            });

            if (sort.field && sort.direction) {
                const field = sort.field;
                result = [...result].sort((a, b) => {
                    const aVal = a[field];
                    const bVal = b[field];
                    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            return result;
        }
    );