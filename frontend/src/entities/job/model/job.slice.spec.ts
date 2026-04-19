import { describe, it, expect } from 'vitest';
import { jobReducer, applyOptimisticUpdate, rollbackOptimisticUpdate } from './job.slice';
import { makeSelectFilteredJobs } from './job.selectors';
import { Job } from './job.types';
import { RootState } from '@/app/providers/store';

const initialState: RootState['job'] = {
  selectedJobIds: [],
  filters: {},
  pagination: { page: 1, pageSize: 10 },
  sort: {},
  optimisticUpdates: {},
};
describe('jobSlice', () => {

  it('should handle applyOptimisticUpdate', () => {
    const action = applyOptimisticUpdate({ id: '1', changes: { status: 'Completed' } });
    const state = jobReducer(initialState, action);
    expect(state.optimisticUpdates['1']).toEqual({ status: 'Completed' });
  });

  it('should handle rollbackOptimisticUpdate', () => {
    const prevState: RootState['job'] = { ...initialState, optimisticUpdates: { '1': { status: 'Completed' } } };
    const action = rollbackOptimisticUpdate('1');
    const state = jobReducer(prevState, action);
    expect(state.optimisticUpdates['1']).toBeUndefined();
  });
});

describe('jobSelectors', () => {
  const mockJobs: Job[] = [
    { id: '1', title: 'Roof Repair', status: 'Scheduled' },
    { id: '2', title: 'Inspection', status: 'Completed' },
  ];

  it('should filter jobs by status', () => {
    const state: RootState = {
      job: {
        ...initialState,
        filters: { status: 'Completed' },
      }
    };

    const selectFiltered = makeSelectFilteredJobs(mockJobs);
    const result = selectFiltered(state);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should apply optimistic updates to filtered jobs', () => {
    const state: RootState = {
      job: {
        ...initialState,
        optimisticUpdates: { '1': { status: 'Completed' } },
      }
    };

    const selectFiltered = makeSelectFilteredJobs(mockJobs);
    const result = selectFiltered(state);

    expect(result.find(j => j.id === '1')?.status).toBe('Completed');
  });
});
