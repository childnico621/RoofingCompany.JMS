import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateJob } from './use-create-job.hook';
import { useDispatch } from 'react-redux';
import { createJobAction } from '@/app/jobs/actions/create-job.action';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('@/app/jobs/actions/create-job.action', () => ({
  createJobAction: vi.fn(),
}));

describe('useCreateJob', () => {
  it('should update fields and handle submit', async () => {
    const dispatch = vi.fn();
    vi.mocked(useDispatch).mockReturnValue(dispatch);
    vi.mocked(createJobAction).mockResolvedValue({ success: true, job: { id: '1', title: 'Test', status: 'Scheduled' } });

    const { result } = renderHook(() => useCreateJob());

    act(() => {
      result.current.setField('title', 'Test Job');
    });

    expect(result.current.fields.title).toBe('Test Job');

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createJobAction).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Job' }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: expect.stringContaining('optimistic') }));
  });

  it('should handle validation error', async () => {
    const { result } = renderHook(() => useCreateJob());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe('Title is required.');
  });
});
