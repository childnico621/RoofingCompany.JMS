'use client';

import React, { createContext, useContext } from 'react';
import type { JobStatus } from '@/entities/job/model/job.types';

type FilterBarContextValue = { onReset: () => void };
const FilterBarContext = createContext<FilterBarContextValue | null>(null);

function useFilterBarContext() {
    const ctx = useContext(FilterBarContext);
    if (!ctx) throw new Error('FilterBar sub-components must be used inside <FilterBar>');
    return ctx;
}

function Status({ value, onChange }: { value: JobStatus | undefined; onChange: (s: JobStatus | undefined) => void }) {
    const statuses: { label: string; value: JobStatus | '' }[] = [
        { label: 'All statuses', value: '' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'In progress', value: 'InProgress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];
    return (
        <div className="filter-bar__group" data-testid="filter-status-group">
            <label htmlFor="filter-status" className="filter-bar__label">Status</label>
            <select
                id="filter-status"
                className="filter-bar__select"
                value={value ?? ''}
                onChange={e => onChange(e.target.value ? (e.target.value as JobStatus) : undefined)}
                data-testid="filter-status"
            >
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
        </div>
    );
}

function Search({ value, onChange }: { value: string | undefined; onChange: (s: string) => void }) {
    return (
        <div className="filter-bar__group" data-testid="filter-search-group">
            <label htmlFor="filter-search" className="filter-bar__label">Search</label>
            <input
                id="filter-search"
                className="filter-bar__input"
                type="search"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder="Search by title..."
                data-testid="filter-search"
                aria-label="Search jobs by title"
            />
        </div>
    );
}

function Reset() {
    const { onReset } = useFilterBarContext();
    return (
        <button className="btn btn--ghost filter-bar__reset" onClick={onReset} data-testid="filter-reset" aria-label="Reset all filters">
            Reset
        </button>
    );
}

function FilterBar({ children, onReset }: { children: React.ReactNode; onReset: () => void }) {
    return (
        <FilterBarContext.Provider value={{ onReset }}>
            <div className="filter-bar" data-testid="filter-bar" role="search">
                {children}
            </div>
        </FilterBarContext.Provider>
    );
}

FilterBar.Status = Status;
FilterBar.Search = Search;
FilterBar.Reset = Reset;

export default FilterBar;
