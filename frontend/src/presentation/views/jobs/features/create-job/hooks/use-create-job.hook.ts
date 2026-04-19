import { useReducer, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/providers/store';
import { applyOptimisticUpdate, rollbackOptimisticUpdate, clearOptimisticUpdate } from '@/entities/job/model/job.slice';
import { createJobAction, type CreateJobInput } from '@/app/jobs/actions/create-job.action';

type FormState = {
    title: string;
    description: string;
    scheduledDate: string;
    assigneeId: string;
    isOpen: boolean;
    isSubmitting: boolean;
    error: string | null;
};

type FormAction =
    | { type: 'OPEN_MODAL' }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_FIELD'; field: keyof CreateJobInput; value: string }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

const initialFormState: FormState = {
    title: '',
    description: '',
    scheduledDate: '',
    assigneeId: '',
    isOpen: false,
    isSubmitting: false,
    error: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'OPEN_MODAL':    return { ...initialFormState, isOpen: true };
        case 'CLOSE_MODAL':   return { ...initialFormState, isOpen: false };
        case 'SET_FIELD':     return { ...state, [action.field]: action.value, error: null };
        case 'SUBMIT_START':  return { ...state, isSubmitting: true, error: null };
        case 'SUBMIT_SUCCESS':return { ...initialFormState, isOpen: false };
        case 'SUBMIT_ERROR':  return { ...state, isSubmitting: false, error: action.error };
        default: {
            const _exhaustive: never = action;
            return _exhaustive;
        }
    }
}

type UseCreateJobOptions = {
    onSuccess?: (job: { id: string; title: string; status: string }) => void;
};

export function useCreateJob({ onSuccess }: UseCreateJobOptions = {}) {
    const dispatch = useDispatch<AppDispatch>();
    const [state, formDispatch] = useReducer(formReducer, initialFormState);

    const openModal = useCallback(() => formDispatch({ type: 'OPEN_MODAL' }), []);
    const closeModal = useCallback(() => formDispatch({ type: 'CLOSE_MODAL' }), []);

    const setField = useCallback((field: keyof CreateJobInput, value: string) => {
        formDispatch({ type: 'SET_FIELD', field, value });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!state.title.trim()) {
            formDispatch({ type: 'SUBMIT_ERROR', error: 'Title is required.' });
            return;
        }

        formDispatch({ type: 'SUBMIT_START' });

        const tempId = `optimistic-${Date.now()}`;
        dispatch(applyOptimisticUpdate({ id: tempId, changes: { status: 'Scheduled' } }));

        const result = await createJobAction({
            title: state.title,
            description: state.description,
            scheduledDate: state.scheduledDate,
            assigneeId: state.assigneeId,
        });

        if (result.success) {
            dispatch(clearOptimisticUpdate(tempId));
            formDispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess?.(result.job);
        } else {
            dispatch(rollbackOptimisticUpdate(tempId));
            formDispatch({ type: 'SUBMIT_ERROR', error: result.error });
        }
    }, [state, dispatch, onSuccess]);

    return {
        isOpen: state.isOpen,
        isSubmitting: state.isSubmitting,
        error: state.error,
        fields: { title: state.title, description: state.description, scheduledDate: state.scheduledDate, assigneeId: state.assigneeId },
        openModal,
        closeModal,
        setField,
        handleSubmit,
    };
}
