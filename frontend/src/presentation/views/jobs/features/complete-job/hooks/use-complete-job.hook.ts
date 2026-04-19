import { useReducer, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/providers/store';
import { applyOptimisticUpdate, rollbackOptimisticUpdate, clearOptimisticUpdate } from '@/entities/job/model/job.slice';
import { completeJobAction } from '@/app/jobs/actions/complete-job.action';
import { transitionJob } from '@/entities/job/model/job.transitions';
import { mapStatusToJobState } from '@/entities/job/model/job.utils';
import type { InProgress } from '@/entities/job/model/job.types';

type CompleteJobState = {
    isOpen: boolean;
    isSubmitting: boolean;
    signatureUrl: string;
    error: string | null;
    targetJobId: string | null;
    currentStatus: string | null;
};

type CompleteJobAction =
    | { type: 'OPEN_MODAL'; jobId: string; currentStatus: string }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_SIGNATURE'; value: string }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

const initialState: CompleteJobState = {
    isOpen: false,
    isSubmitting: false,
    signatureUrl: '',
    error: null,
    targetJobId: null,
    currentStatus: null,
};

function completeJobReducer(state: CompleteJobState, action: CompleteJobAction): CompleteJobState {
    switch (action.type) {
        case 'OPEN_MODAL':
            return { ...initialState, isOpen: true, targetJobId: action.jobId, currentStatus: action.currentStatus };
        case 'CLOSE_MODAL':
            return { ...initialState };
        case 'SET_SIGNATURE':
            return { ...state, signatureUrl: action.value, error: null };
        case 'SUBMIT_START':
            return { ...state, isSubmitting: true, error: null };
        case 'SUBMIT_SUCCESS':
            return { ...initialState };
        case 'SUBMIT_ERROR':
            return { ...state, isSubmitting: false, error: action.error };
        default: {
            const _exhaustive: never = action;
            return _exhaustive;
        }
    }
}

type UseCompleteJobOptions = {
    onSuccess?: (jobId: string) => void;
};

export function useCompleteJob({ onSuccess }: UseCompleteJobOptions = {}) {
    const dispatch = useDispatch<AppDispatch>();
    const [state, localDispatch] = useReducer(completeJobReducer, initialState);

    const openModal = useCallback((jobId: string, currentStatus: string) => {
        localDispatch({ type: 'OPEN_MODAL', jobId, currentStatus });
    }, []);

    const closeModal = useCallback(() => {
        localDispatch({ type: 'CLOSE_MODAL' });
    }, []);

    const setSignature = useCallback((value: string) => {
        localDispatch({ type: 'SET_SIGNATURE', value });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!state.targetJobId) return;

        if (!state.signatureUrl.trim()) {
            localDispatch({ type: 'SUBMIT_ERROR', error: 'Signature is required.' });
            return;
        }

        try {
            const currentJobState = mapStatusToJobState(state.currentStatus ?? '');
            transitionJob(currentJobState as InProgress, {
                type: 'complete',
                completedAt: new Date(),
                signatureUrl: state.signatureUrl,
            });
        } catch {
            localDispatch({ type: 'SUBMIT_ERROR', error: 'This job cannot be completed from its current state.' });
            return;
        }

        localDispatch({ type: 'SUBMIT_START' });

        dispatch(applyOptimisticUpdate({ id: state.targetJobId, changes: { status: 'Completed' } }));

        const result = await completeJobAction({ jobId: state.targetJobId, signatureUrl: state.signatureUrl });

        if (result.success) {
            dispatch(clearOptimisticUpdate(state.targetJobId));
            localDispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess?.(state.targetJobId);
        } else {
            dispatch(rollbackOptimisticUpdate(state.targetJobId));
            localDispatch({ type: 'SUBMIT_ERROR', error: result.error });
        }
    }, [state, dispatch, onSuccess]);

    return { isOpen: state.isOpen, isSubmitting: state.isSubmitting, signatureUrl: state.signatureUrl, error: state.error, targetJobId: state.targetJobId, openModal, closeModal, setSignature, handleSubmit };
}
