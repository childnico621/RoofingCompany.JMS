'use server';

import { revalidatePath } from 'next/cache';

export type CreateJobInput = {
    title: string;
    description: string;
    scheduledDate: string;
    assigneeId: string;
};

export type CreateJobResult =
    | { success: true; job: { id: string; title: string; status: string } }
    | { success: false; error: string };

const API_URL = process.env.INTERNAL_API_URL || 'http://jobtracker-backend:8080';

export async function createJobAction(input: CreateJobInput): Promise<CreateJobResult> {
    try {
        const response = await fetch(`${API_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
            },
            body: JSON.stringify({
                title: input.title,
                description: input.description,
                scheduledDate: input.scheduledDate,
                assigneeId: input.assigneeId
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return { success: false, error: errorData || 'Failed to create job' };
        }

        const jobId = await response.json();
        
        revalidatePath('/jobs');

        return { 
            success: true, 
            job: { 
                id: jobId, 
                title: input.title, 
                status: 'Scheduled' 
            } 
        };
    } catch (err) {
        console.error('CreateJobAction Error:', err);
        return { success: false, error: 'Network error. Please ensure the backend is running.' };
    }
}
