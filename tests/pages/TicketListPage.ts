import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Ticket List page.
 */
export class TicketListPage {
    readonly heading: Locator;
    readonly ticketTable: Locator;
    readonly emptyState: Locator;
    readonly newRequestButton: Locator;
    readonly loadingSpinner: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Tickets' });
        this.ticketTable = page.getByTestId('ticket-table');
        this.emptyState = page.getByTestId('empty-state');
        this.newRequestButton = page.getByTestId('btn-new-request');
        this.loadingSpinner = page.getByTestId('loading-spinner');
    }

    async goto(): Promise<void> {
        await this.page.goto('/tickets');
    }

    /** Returns all visible ticket rows. */
    getTicketRows(): Locator {
        return this.page.locator('[data-testid^="ticket-row-"]');
    }

    /** Clicks the link for a specific ticket by ID. */
    async clickTicket(ticketId: string): Promise<void> {
        await this.page.getByTestId(`ticket-link-${ticketId}`).click();
    }

    /** Returns the first ticket link on the page. */
    getFirstTicketLink(): Locator {
        return this.page.locator('[data-testid^="ticket-link-"]').first();
    }
}
