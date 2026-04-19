'use server';

const API_URL = process.env.INTERNAL_API_URL || 'http://jobtracker-backend:8080';

export async function getJobsAction() {
    try {
        const response = await fetch(`${API_URL}/api/jobs`, {
            method: 'GET',
            headers: {
                'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
            },
            next: { revalidate: 0 } // No cache for development
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.items || [];
    } catch (err) {
        console.error('getJobsAction Error:', err);
        return [];
    }
}
