/**
 * https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-exhaustiveness-checking
 */
import { Completed, JobState, InProgress, Scheduled, Cancelled } from "./job.types";

export type JobAction =
    | { type: 'schedule'; date: Date; assigneeId: string }
    | { type: 'start'; startedAt: Date }
    | { type: 'complete'; completedAt: Date; signatureUrl: string }
    | { type: 'cancel'; reason: string };

type Transitions = {
    Draft: Scheduled;
    Scheduled: InProgress | Cancelled;
    InProgress: Completed | Cancelled;
    Completed: never;
    Cancelled: never;
};

export type AllowedActions = {
    Draft: { type: 'schedule'; date: Date; assigneeId: string };
    Scheduled:
        | { type: 'start'; startedAt: Date }
        | { type: 'cancel'; reason: string };
    InProgress:
        | { type: 'complete'; completedAt: Date; signatureUrl: string }
        | { type: 'cancel'; reason: string };
    Completed: never;
    Cancelled: never;
};

export function transitionJob<T extends JobState>(current: T, action: AllowedActions[T['type']]): JobState {
    switch (current.type) {
        case 'Draft':
            if (action.type === 'schedule') {
                return { type: 'Scheduled', scheduledDate: action.date, assigneeId: action.assigneeId };
            }
            break;

        case 'Scheduled':
            if (action.type === 'start') {
                return { type: 'InProgress', startedAt: action.startedAt, assigneeId: current.assigneeId, photos: [] };
            }
            if (action.type === 'cancel') {
                return { type: 'Cancelled', cancelledAt: new Date(), reason: action.reason };
            }
            break;

        case 'InProgress':
            if (action.type === 'complete') {
                return {
                    type: 'Completed',
                    startedAt: current.startedAt,
                    completedAt: action.completedAt,
                    assigneeId: current.assigneeId,
                    photos: current.photos,
                    signatureUrl: action.signatureUrl,
                };
            }
            if (action.type === 'cancel') {
                return { type: 'Cancelled', cancelledAt: new Date(), reason: action.reason };
            }
            break;

        case 'Completed':
        case 'Cancelled':
            throw new Error('Terminal state');
    }

    throw new Error('Invalid transition');
}