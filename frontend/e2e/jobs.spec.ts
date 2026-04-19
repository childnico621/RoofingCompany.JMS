import { test, expect } from '@playwright/test';
import { JobsPage } from './pages/jobs.page';

test.describe('Jobs Lifecycle', () => {
  test('should create, filter, and complete a job', async ({ page }) => {
    const jobsPage = new JobsPage(page);
    const jobTitle = `Roof Repair ${Date.now()}`;

    await jobsPage.goto();

    // 1. Create a new job
    await jobsPage.createJob(jobTitle, 'Repairing a leak in the roof');
    
    // 2. Verify job appears in table
    await expect(jobsPage.jobTableRows.filter({ hasText: jobTitle })).toBeVisible();

    // 3. Filter by status
    await jobsPage.filterByStatus('Scheduled');
    await expect(jobsPage.jobTableRows.filter({ hasText: jobTitle })).toBeVisible();

    // 4. Complete the job
    await jobsPage.completeJob(jobTitle);

    // 5. Verify status changes to "Completed"
    const status = await jobsPage.getJobStatus(jobTitle);
    expect(status).toBe('Completed');
  });
});
