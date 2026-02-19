import { test, expect } from '@playwright/test';
import { TicketListPage } from '../pages/TicketListPage';
import { VALID_REPAIR_REQUEST, API_BASE_URL } from '../fixtures/testData';

/**
 * Ticket List Tests
 *
 * Validates the ticket list view.
 * Note: Tests run against a shared in-memory store,
 * so assertions use existence checks rather than exact counts.
 */
test.describe('Ticket List', () => {
    test('should display the ticket table with a ticket after creating one via API', async ({ page, request }) => {
        // Arrange — create a ticket via the API
        const response = await request.post(`${API_BASE_URL}/api/repair-requests`, {
            data: VALID_REPAIR_REQUEST,
        });
        const { ticketId } = await response.json();

        // Act — navigate to ticket list
        const ticketListPage = new TicketListPage(page);
        await ticketListPage.goto();

        // Assert — table is visible and contains our ticket
        await expect(ticketListPage.ticketTable).toBeVisible();
        await expect(page.getByTestId(`ticket-link-${ticketId}`)).toBeVisible();
    });

    test('should navigate to ticket detail when clicking a ticket link', async ({ page, request }) => {
        // Arrange — create a ticket
        const response = await request.post(`${API_BASE_URL}/api/repair-requests`, {
            data: VALID_REPAIR_REQUEST,
        });
        const { ticketId } = await response.json();

        // Act — navigate to list and click the ticket
        const ticketListPage = new TicketListPage(page);
        await ticketListPage.goto();
        await page.getByTestId(`ticket-link-${ticketId}`).click();

        // Assert — navigated to detail page
        await expect(page).toHaveURL(`/tickets/${ticketId}`);
        await expect(page.getByTestId('ticket-name')).toHaveText(VALID_REPAIR_REQUEST.name);
    });
});
