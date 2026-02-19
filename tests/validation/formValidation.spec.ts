import { test, expect } from '@playwright/test';
import { RepairRequestPage } from '../pages/RepairRequestPage';
import { VALID_REPAIR_REQUEST } from '../fixtures/testData';

/**
 * Validation Tests
 *
 * Verifies that the form enforces required-field validation
 * and displays appropriate error messages to the user.
 */
test.describe('Repair Request — Form Validation', () => {
    let repairPage: RepairRequestPage;

    test.beforeEach(async ({ page }) => {
        repairPage = new RepairRequestPage(page);
        await repairPage.goto();
    });

    test('should display all validation errors when submitting an empty form', async () => {
        // Act — submit without filling any fields
        await repairPage.submit();

        // Assert — all five error messages are visible
        await expect(repairPage.errorName).toBeVisible();
        await expect(repairPage.errorName).toHaveText('Name is required');

        await expect(repairPage.errorAddress).toBeVisible();
        await expect(repairPage.errorAddress).toHaveText('Address is required');

        await expect(repairPage.errorIssueType).toBeVisible();
        await expect(repairPage.errorIssueType).toHaveText('Issue type is required');

        await expect(repairPage.errorPriority).toBeVisible();
        await expect(repairPage.errorPriority).toHaveText('Priority is required');

        await expect(repairPage.errorDescription).toBeVisible();
        await expect(repairPage.errorDescription).toHaveText('Description is required');

        // Assert — success message should NOT appear
        await expect(repairPage.successMessage).not.toBeVisible();
    });

    test('should display errors only for unfilled fields when partially completing the form', async () => {
        // Arrange — fill only name and address
        await repairPage.nameInput.fill(VALID_REPAIR_REQUEST.name);
        await repairPage.addressInput.fill(VALID_REPAIR_REQUEST.address);

        // Act — submit
        await repairPage.submit();

        // Assert — name and address errors should NOT appear
        await expect(repairPage.errorName).not.toBeVisible();
        await expect(repairPage.errorAddress).not.toBeVisible();

        // Assert — remaining fields should show errors
        await expect(repairPage.errorIssueType).toBeVisible();
        await expect(repairPage.errorPriority).toBeVisible();
        await expect(repairPage.errorDescription).toBeVisible();
    });

    test('should clear a field error when the user starts typing in that field', async () => {
        // Submit empty form to trigger all errors
        await repairPage.submit();
        await expect(repairPage.errorName).toBeVisible();

        // Start typing in the name field
        await repairPage.nameInput.fill('Jan');

        // Assert — name error is cleared
        await expect(repairPage.errorName).not.toBeVisible();

        // Assert — other errors remain
        await expect(repairPage.errorAddress).toBeVisible();
        await expect(repairPage.errorDescription).toBeVisible();
    });
});
