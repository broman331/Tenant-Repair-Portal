import { test, expect } from '@playwright/test';
import { TicketDetailPage } from '../pages/TicketDetailPage';
import { VALID_REPAIR_REQUEST, API_BASE_URL, UUID_V4_REGEX } from '../fixtures/testData';

/**
 * Ticket Detail Tests
 *
 * Validates the ticket detail view and worker assignment flow.
 */
test.describe('Ticket Detail', () => {
    let ticketId: string;

    test.beforeEach(async ({ request }) => {
        // Create a ticket via API for each test
        const response = await request.post(`${API_BASE_URL}/api/repair-requests`, {
            data: VALID_REPAIR_REQUEST,
        });
        const body = await response.json();
        ticketId = body.ticketId;
    });

    test('should display all ticket details correctly', async ({ page }) => {
        const detailPage = new TicketDetailPage(page);
        await detailPage.goto(ticketId);

        // Assert — all fields are displayed
        await expect(detailPage.ticketName).toHaveText(VALID_REPAIR_REQUEST.name);
        await expect(detailPage.ticketAddress).toHaveText(VALID_REPAIR_REQUEST.address);
        await expect(detailPage.ticketDescription).toHaveText(VALID_REPAIR_REQUEST.description);
        await expect(detailPage.ticketIssueType).toContainText(VALID_REPAIR_REQUEST.issueType);

        // Assert — ticket ID matches UUID format
        const idText = await detailPage.ticketId.textContent();
        expect(idText).toMatch(UUID_V4_REGEX);

        // Assert — no worker assigned initially
        await expect(detailPage.noWorker).toBeVisible();
    });

    test('should assign a worker to the ticket', async ({ page, request }) => {
        // Arrange — create a worker via API
        const workerRes = await request.post(`${API_BASE_URL}/api/workers`, {
            data: { name: 'Pieter Bakker', specialization: 'Plumber' },
        });
        expect(workerRes.status()).toBe(201);

        // Act — navigate to ticket detail and assign the worker
        const detailPage = new TicketDetailPage(page);
        await detailPage.goto(ticketId);

        // Wait for the worker select to be populated
        await expect(detailPage.assignWorkerSelect).toBeVisible();
        await detailPage.assignWorker('Pieter Bakker');

        // Assert — assignment confirmed
        await expect(detailPage.assignMessage).toBeVisible();
        await expect(detailPage.assignedWorkerName).toHaveText('Pieter Bakker');
        await expect(detailPage.assignedWorkerSpec).toHaveText('Plumber');
    });
});
