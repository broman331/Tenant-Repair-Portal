import { test, expect } from '@playwright/test';
import { RepairRequestPage } from '../pages/RepairRequestPage';
import { VALID_REPAIR_REQUEST, UUID_V4_REGEX } from '../fixtures/testData';

/**
 * Functional Tests — Green Path
 *
 * Validates the complete happy-path flow:
 * filling the form → submitting → receiving a success confirmation with a ticket ID.
 */
test.describe('Repair Request — Functional (Green Path)', () => {
    let repairPage: RepairRequestPage;

    test.beforeEach(async ({ page }) => {
        repairPage = new RepairRequestPage(page);
        await repairPage.goto();
    });

    test('should successfully submit a repair request and display a valid ticket ID', async () => {
        // Arrange & Act — fill form with valid data and submit
        await repairPage.fillAndSubmit(VALID_REPAIR_REQUEST);

        // Assert — success message is visible
        await expect(repairPage.successMessage).toBeVisible();

        // Assert — ticket ID is present and matches UUID v4 format
        const ticketId = await repairPage.getTicketIdText();
        expect(ticketId).toMatch(UUID_V4_REGEX);
    });

    test('should allow submitting a new request after a successful submission', async () => {
        // Submit the first request
        await repairPage.fillAndSubmit(VALID_REPAIR_REQUEST);
        await expect(repairPage.successMessage).toBeVisible();

        // Click "Submit Another Request"
        await repairPage.newRequestButton.click();

        // Assert — form is visible again and fields are cleared
        await expect(repairPage.nameInput).toBeVisible();
        await expect(repairPage.nameInput).toHaveValue('');
        await expect(repairPage.addressInput).toHaveValue('');
        await expect(repairPage.descriptionTextarea).toHaveValue('');
    });
});
