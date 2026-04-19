import { describe, it, expect } from 'vitest';
import { transitionJob } from './job.transitions';
import { JobState } from './job.types';

describe('transitionJob', () => {
  it('should transition from Draft to Scheduled', () => {
    const current: JobState = { type: 'Draft' };
    const date = new Date();
    const result = transitionJob(current, { type: 'schedule', date, assigneeId: '1' });
    
    expect(result.type).toBe('Scheduled');
    if (result.type === 'Scheduled') {
      expect(result.scheduledDate).toBe(date);
      expect(result.assigneeId).toBe('1');
    }
  });

  it('should transition from Scheduled to InProgress', () => {
    const current: JobState = { type: 'Scheduled', scheduledDate: new Date(), assigneeId: '1' };
    const date = new Date();
    const result = transitionJob(current, { type: 'start', startedAt: date });
    
    expect(result.type).toBe('InProgress');
    if (result.type === 'InProgress') {
      expect(result.startedAt).toBe(date);
    }
  });

  it('should throw error for terminal states', () => {
    const current: JobState = { type: 'Completed', startedAt: new Date(), completedAt: new Date(), assigneeId: '1', photos: [], signatureUrl: '' };
    
    // @ts-expect-error - testing runtime protection if any
    expect(() => transitionJob(current, { type: 'cancel', reason: '' })).toThrow();
  });
});
