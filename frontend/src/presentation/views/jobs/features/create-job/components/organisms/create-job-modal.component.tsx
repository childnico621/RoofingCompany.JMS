'use client';

type CreateJobModalProps = {
    isOpen: boolean;
    isSubmitting: boolean;
    error: string | null;
    fields: { title: string; description: string; scheduledDate: string; assigneeId: string };
    onClose: () => void;
    onSubmit: () => void;
    onFieldChange: (field: 'title' | 'description' | 'scheduledDate' | 'assigneeId', value: string) => void;
};

export default function CreateJobModal({ isOpen, isSubmitting, error, fields, onClose, onSubmit, onFieldChange }: CreateJobModalProps) {
    return isOpen ? (
        <div className="modal-overlay" data-testid="create-job-modal" role="dialog" aria-modal="true" aria-labelledby="create-job-title">
            <div className="modal">
                <div className="modal__header">
                    <h2 id="create-job-title" className="modal__title">Create New Job</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Close modal" data-testid="create-job-modal-close">✕</button>
                </div>
                <div className="modal__body">
                    <div className="form-group">
                        <label htmlFor="job-title" className="form-label">Title <span className="form-required">*</span></label>
                        <input id="job-title" className="form-input" type="text" value={fields.title} onChange={e => onFieldChange('title', e.target.value)} placeholder="e.g. Roof Repair — 123 Main St" disabled={isSubmitting} data-testid="create-job-title" aria-required="true" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="job-description" className="form-label">Description</label>
                        <textarea id="job-description" className="form-input form-input--textarea" value={fields.description} onChange={e => onFieldChange('description', e.target.value)} placeholder="Details about the job..." disabled={isSubmitting} rows={3} data-testid="create-job-description" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="job-scheduled-date" className="form-label">Scheduled Date <span className="form-required">*</span></label>
                        <input id="job-scheduled-date" className="form-input" type="date" value={fields.scheduledDate} onChange={e => onFieldChange('scheduledDate', e.target.value)} disabled={isSubmitting} data-testid="create-job-scheduled-date" aria-required="true" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="job-assignee" className="form-label">Assignee ID</label>
                        <input id="job-assignee" className="form-input" type="text" value={fields.assigneeId} onChange={e => onFieldChange('assigneeId', e.target.value)} placeholder="e.g. usr_123" disabled={isSubmitting} data-testid="create-job-assignee" />
                    </div>
                    {error !== null ? (
                        <p className="form-error" role="alert" data-testid="create-job-error">{error}</p>
                    ) : null}
                </div>
                <div className="modal__footer">
                    <button className="btn btn--secondary" onClick={onClose} disabled={isSubmitting} data-testid="create-job-cancel">Cancel</button>
                    <button className="btn btn--primary" onClick={onSubmit} disabled={isSubmitting} data-testid="create-job-submit" aria-busy={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}
