import { test, expect } from '@playwright/test';
import { WorkerListPage } from '../pages/WorkerListPage';
import { API_BASE_URL } from '../fixtures/testData';

/**
 * Workers Management Tests
 *
 * Validates creating and deleting workers via the UI.
 * Tests use unique worker names and existence checks
 * to be resilient against shared in-memory state.
 */
test.describe('Workers Management', () => {
    test('should add a new worker via the form', async ({ page }) => {
        const workerPage = new WorkerListPage(page);
        await workerPage.goto();

        // Capture initial row count
        const initialCount = await workerPage.getWorkerRows().count();

        // Act — add a worker with a unique name
        const uniqueName = `TestWorker_${Date.now()}`;
        await workerPage.addWorker(uniqueName, 'Plumber');

        // Assert — worker appears in the table
        await expect(workerPage.workerTable).toBeVisible();
        await expect(workerPage.getWorkerRows()).toHaveCount(initialCount + 1);
        await expect(page.getByText(uniqueName)).toBeVisible();
    });

    test('should delete a worker from the list', async ({ page, request }) => {
        // Arrange — create a worker via API with unique name
        const uniqueName = `DeleteMe_${Date.now()}`;
        const res = await request.post(`${API_BASE_URL}/api/workers`, {
            data: { name: uniqueName, specialization: 'Electrician' },
        });
        const { worker } = await res.json();

        // Navigate to workers page
        const workerPage = new WorkerListPage(page);
        await workerPage.goto();

        // Assert — worker is visible
        await expect(workerPage.getWorkerName(worker.id)).toHaveText(uniqueName);

        // Capture current row count before delete
        const countBefore = await workerPage.getWorkerRows().count();

        // Act — delete the worker
        await workerPage.deleteWorker(worker.id);

        // Assert — one fewer row
        await expect(workerPage.getWorkerRows()).toHaveCount(countBefore - 1);
    });

    test('should show validation error when adding worker without a name', async ({ page }) => {
        const workerPage = new WorkerListPage(page);
        await workerPage.goto();

        // Act — submit without a name
        await workerPage.specializationSelect.selectOption('General');
        await workerPage.addWorkerButton.click();

        // Assert — error message visible
        await expect(workerPage.addWorkerError).toBeVisible();
        await expect(workerPage.addWorkerError).toHaveText('Worker name is required');
    });
});
