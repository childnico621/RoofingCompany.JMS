import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JobStatus } from './job.types';


interface JobUIState {
    selectedJobIds: string[];
    filters: { status?: JobStatus; search?: string };
    pagination: { page: number; pageSize: number };
    sort: { field?: 'title' | 'status'; direction?: 'asc' | 'desc' };
    optimisticUpdates: Record<string, { status?: JobStatus }>;
}

const initialState: JobUIState = {
    selectedJobIds: [],
    filters: {},
    pagination: { page: 1, pageSize: 10 },
    sort: {},
    optimisticUpdates: {},
};

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<JobUIState['filters']>) {
            state.filters = action.payload;
        },
        toggleSelection(state, action: PayloadAction<string>) {
            const id = action.payload;
            if (state.selectedJobIds.includes(id)) {
                state.selectedJobIds = state.selectedJobIds.filter(x => x !== id);
            } else {
                state.selectedJobIds.push(id);
            }
        },
        setSort(state, action: PayloadAction<JobUIState['sort']>) {
            state.sort = action.payload;
        },
        applyOptimisticUpdate(state, action: PayloadAction<{ id: string; changes: { status?: JobStatus } }>) {
            state.optimisticUpdates[action.payload.id] = action.payload.changes;
        },
        rollbackOptimisticUpdate(state, action: PayloadAction<string>) {
            delete state.optimisticUpdates[action.payload];
        },
        clearOptimisticUpdate(state, action: PayloadAction<string>) {
            delete state.optimisticUpdates[action.payload];
        },
    },
});

export const { setFilters, toggleSelection, setSort, applyOptimisticUpdate, rollbackOptimisticUpdate, clearOptimisticUpdate } = jobSlice.actions;
export const jobReducer = jobSlice.reducer;