import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Ticket Detail page.
 */
export class TicketDetailPage {
    readonly ticketIssueType: Locator;
    readonly ticketName: Locator;
    readonly ticketAddress: Locator;
    readonly ticketDescription: Locator;
    readonly ticketId: Locator;
    readonly assignedWorker: Locator;
    readonly assignedWorkerName: Locator;
    readonly assignedWorkerSpec: Locator;
    readonly noWorker: Locator;
    readonly assignWorkerSelect: Locator;
    readonly assignWorkerButton: Locator;
    readonly assignMessage: Locator;
    readonly loadingSpinner: Locator;
    readonly errorMessage: Locator;

    constructor(private readonly page: Page) {
        this.ticketIssueType = page.getByTestId('ticket-issue-type');
        this.ticketName = page.getByTestId('ticket-name');
        this.ticketAddress = page.getByTestId('ticket-address');
        this.ticketDescription = page.getByTestId('ticket-description');
        this.ticketId = page.getByTestId('ticket-id');
        this.assignedWorker = page.getByTestId('assigned-worker');
        this.assignedWorkerName = page.getByTestId('assigned-worker-name');
        this.assignedWorkerSpec = page.getByTestId('assigned-worker-spec');
        this.noWorker = page.getByTestId('no-worker');
        this.assignWorkerSelect = page.getByTestId('assign-worker-select');
        this.assignWorkerButton = page.getByTestId('assign-worker-button');
        this.assignMessage = page.getByTestId('assign-message');
        this.loadingSpinner = page.getByTestId('loading-spinner');
        this.errorMessage = page.getByTestId('error-message');
    }

    async goto(ticketId: string): Promise<void> {
        await this.page.goto(`/tickets/${ticketId}`);
    }

    /** Assign a worker by selecting from the dropdown and clicking Assign. */
    async assignWorker(workerName: string): Promise<void> {
        const options = this.assignWorkerSelect.locator('option');
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = await options.nth(i).textContent();
            if (text?.includes(workerName)) {
                const value = await options.nth(i).getAttribute('value');
                if (value) {
                    await this.assignWorkerSelect.selectOption(value);
                    break;
                }
            }
        }
        await this.assignWorkerButton.click();
    }
}
