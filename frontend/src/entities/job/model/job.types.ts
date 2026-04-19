/**
 * https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
 */

export type Draft = {
    type: 'Draft';
    notes?: string;
};

export type Scheduled = {
    type: 'Scheduled';
    scheduledDate: Date;
    assigneeId: string;
};

export type InProgress = {
    type: 'InProgress';
    startedAt: Date;
    assigneeId: string;
    photos: string[];
};

export type Completed = {
    type: 'Completed';
    startedAt: Date;
    completedAt: Date;
    assigneeId: string;
    photos: string[];
    signatureUrl: string;
};

export type Cancelled = {
    type: 'Cancelled';
    cancelledAt: Date;
    reason: string;
};

export type Job = {
    id: string;
    title: string;
    status: string;
};

export type JobStatus = JobState['type'];

export type JobState =
    | Draft
    | Scheduled
    | InProgress
    | Completed
    | Cancelled;
