'use server';

export type CompleteJobInput = { jobId: string; signatureUrl: string };

export type CompleteJobResult =
    | { success: true }
    | { success: false; error: string };

export async function completeJobAction(input: CompleteJobInput): Promise<CompleteJobResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!input.jobId) return { success: false, error: 'Job ID is required.' };
        if (!input.signatureUrl.trim()) return { success: false, error: 'Signature is required to complete a job.' };
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to complete job. Please try again.' };
    }
}
