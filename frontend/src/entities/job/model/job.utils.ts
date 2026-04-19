import { JobState } from "./job.types";

function assertNever(x: never): never {
    throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

export function getJobSummary(state: JobState): string {
    switch (state.type) {
        case 'Draft':       return 'Draft job';
        case 'Scheduled':   return `Scheduled for ${state.scheduledDate.toLocaleDateString()}`;
        case 'InProgress':  return `In progress since ${state.startedAt.toLocaleDateString()}`;
        case 'Completed':   return `Completed at ${state.completedAt.toLocaleDateString()}`;
        case 'Cancelled':   return `Cancelled: ${state.reason}`;
        default: {
            const _exhaustive: never = state;
            return assertNever(_exhaustive);
        }
    }
}

export function mapStatusToJobState(status: string): JobState {
    switch (status) {
        case 'Scheduled':  return { type: 'Scheduled', scheduledDate: new Date(), assigneeId: '' };
        case 'InProgress': return { type: 'InProgress', startedAt: new Date(), assigneeId: '', photos: [] };
        case 'Completed':  return { type: 'Completed', startedAt: new Date(), completedAt: new Date(), assigneeId: '', photos: [], signatureUrl: '' };
        case 'Cancelled':  return { type: 'Cancelled', cancelledAt: new Date(), reason: '' };
        default:           return { type: 'Draft' };
    }
}