import { describe, it, expect } from 'vitest';
import { jobReducer, applyOptimisticUpdate, rollbackOptimisticUpdate, setFilters } from './job.slice';
import { makeSelectFilteredJobs } from './job.selectors';
import { Job } from './job.types';

describe('jobSlice', () => {
  const initialState = {
    selectedJobIds: [],
    filters: {},
    pagination: { page: 1, pageSize: 10 },
    sort: {},
    optimisticUpdates: {},
  };

  it('should handle applyOptimisticUpdate', () => {
    const action = applyOptimisticUpdate({ id: '1', changes: { status: 'Completed' } });
    const state = jobReducer(initialState, action);
    expect(state.optimisticUpdates['1']).toEqual({ status: 'Completed' });
  });

  it('should handle rollbackOptimisticUpdate', () => {
    const prevState = { ...initialState, optimisticUpdates: { '1': { status: 'Completed' } } };
    const action = rollbackOptimisticUpdate('1');
    const state = jobReducer(prevState, action);
    expect(state.optimisticUpdates['1']).toBeUndefined();
  });
});

describe('jobSelectors', () => {
  const mockJobs: Job[] = [
    { id: '1', title: 'Roof Repair', status: 'Scheduled', street: '', city: '', state: '', zipCode: '' },
    { id: '2', title: 'Inspection', status: 'Completed', street: '', city: '', state: '', zipCode: '' },
  ];

  it('should filter jobs by status', () => {
    const state = {
      job: {
        filters: { status: 'Completed' },
        sort: {},
        optimisticUpdates: {},
      }
    } as any;

    const selectFiltered = makeSelectFilteredJobs(mockJobs);
    const result = selectFiltered(state);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should apply optimistic updates to filtered jobs', () => {
    const state = {
      job: {
        filters: {},
        sort: {},
        optimisticUpdates: { '1': { status: 'Completed' } },
      }
    } as any;

    const selectFiltered = makeSelectFilteredJobs(mockJobs);
    const result = selectFiltered(state);

    expect(result.find(j => j.id === '1')?.status).toBe('Completed');
  });
});
