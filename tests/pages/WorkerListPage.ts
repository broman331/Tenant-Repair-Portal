import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Workers management page.
 */
export class WorkerListPage {
    readonly heading: Locator;
    readonly workerTable: Locator;
    readonly emptyState: Locator;
    readonly loadingSpinner: Locator;

    // Add Worker form
    readonly workerNameInput: Locator;
    readonly specializationSelect: Locator;
    readonly addWorkerButton: Locator;
    readonly addWorkerError: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Workers' });
        this.workerTable = page.getByTestId('worker-table');
        this.emptyState = page.getByTestId('empty-state');
        this.loadingSpinner = page.getByTestId('loading-spinner');

        this.workerNameInput = page.getByTestId('input-worker-name');
        this.specializationSelect = page.getByTestId('select-worker-specialization');
        this.addWorkerButton = page.getByTestId('btn-add-worker');
        this.addWorkerError = page.getByTestId('add-worker-error');
    }

    async goto(): Promise<void> {
        await this.page.goto('/workers');
    }

    /** Add a new worker via the inline form. */
    async addWorker(name: string, specialization: string): Promise<void> {
        await this.workerNameInput.fill(name);
        await this.specializationSelect.selectOption(specialization);
        await this.addWorkerButton.click();
    }

    /** Returns all visible worker rows. */
    getWorkerRows(): Locator {
        return this.page.locator('[data-testid^="worker-row-"]');
    }

    /** Delete a worker by their row ID. */
    async deleteWorker(workerId: string): Promise<void> {
        await this.page.getByTestId(`btn-delete-worker-${workerId}`).click();
    }

    /** Returns the name cell for a specific worker. */
    getWorkerName(workerId: string): Locator {
        return this.page.getByTestId(`worker-name-${workerId}`);
    }
}
