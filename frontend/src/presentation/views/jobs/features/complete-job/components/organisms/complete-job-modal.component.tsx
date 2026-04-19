'use client';

type CompleteJobModalProps = {
    isOpen: boolean;
    isSubmitting: boolean;
    signatureUrl: string;
    error: string | null;
    onClose: () => void;
    onSubmit: () => void;
    onSignatureChange: (value: string) => void;
};

export default function CompleteJobModal({ isOpen, isSubmitting, signatureUrl, error, onClose, onSubmit, onSignatureChange }: CompleteJobModalProps) {
    return isOpen ? (
        <div className="modal-overlay" data-testid="complete-job-modal" role="dialog" aria-modal="true" aria-labelledby="complete-job-title">
            <div className="modal">
                <div className="modal__header">
                    <h2 id="complete-job-title" className="modal__title">Complete Job</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Close modal" data-testid="complete-job-modal-close">✕</button>
                </div>
                <div className="modal__body">
                    <p className="modal__description">Provide the customer signature URL to mark this job as completed.</p>
                    <div className="form-group">
                        <label htmlFor="signature-url" className="form-label">Signature URL <span className="form-required">*</span></label>
                        <input id="signature-url" className="form-input" type="url" value={signatureUrl} onChange={e => onSignatureChange(e.target.value)} placeholder="https://signatures.example.com/..." disabled={isSubmitting} data-testid="complete-job-signature" aria-required="true" />
                    </div>
                    {error !== null ? (
                        <p className="form-error" role="alert" data-testid="complete-job-error">{error}</p>
                    ) : null}
                </div>
                <div className="modal__footer">
                    <button className="btn btn--secondary" onClick={onClose} disabled={isSubmitting} data-testid="complete-job-cancel">Cancel</button>
                    <button className="btn btn--success" onClick={onSubmit} disabled={isSubmitting} data-testid="complete-job-submit" aria-busy={isSubmitting}>
                        {isSubmitting ? 'Completing...' : 'Mark as Completed'}
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}
