import { Page, Locator, expect } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly createJobButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;
  readonly jobTableRows: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createJobButton = page.getByTestId('create-job-button');
    this.titleInput = page.getByTestId('job-title-input');
    this.descriptionInput = page.getByTestId('job-description-input');
    this.submitButton = page.getByTestId('submit-job-button');
    this.jobTableRows = page.getByTestId('job-table-row');
    this.statusFilter = page.getByTestId('status-filter-select');
  }

  async goto() {
    await this.page.goto('/jobs');
  }

  async createJob(title: string, description: string) {
    await this.createJobButton.click();
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.submitButton.click();
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
  }

  async completeJob(title: string) {
    const row = this.jobTableRows.filter({ hasText: title });
    await row.getByTestId('complete-job-button').click();
  }

  async getJobStatus(title: string) {
    const row = this.jobTableRows.filter({ hasText: title });
    return await row.getByTestId('job-status-badge').innerText();
  }
}
