'use server';

export type CreateJobInput = {
    title: string;
    description: string;
    scheduledDate: string;
    assigneeId: string;
};

export type CreateJobResult =
    | { success: true; job: { id: string; title: string; status: string } }
    | { success: false; error: string };

export async function createJobAction(input: CreateJobInput): Promise<CreateJobResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (!input.title.trim()) return { success: false, error: 'Title is required.' };
        return { success: true, job: { id: crypto.randomUUID(), title: input.title.trim(), status: 'scheduled' } };
    } catch {
        return { success: false, error: 'Failed to create job. Please try again.' };
    }
}
