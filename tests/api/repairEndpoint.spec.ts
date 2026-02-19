import { test, expect } from '@playwright/test';
import { VALID_REPAIR_REQUEST, ALTERNATE_REPAIR_REQUEST, UUID_V4_REGEX, API_BASE_URL } from '../fixtures/testData';

/**
 * API Tests — Repair Requests
 *
 * Directly tests the REST endpoints using Playwright's request utility.
 * These tests bypass the UI entirely and validate the API contract.
 *
 * @see https://playwright.dev/docs/api-testing
 */
test.describe('Repair Request — API Endpoint', () => {
    const ENDPOINT = `${API_BASE_URL}/api/repair-requests`;

    test('POST /api/repair-requests — should return 201 with a valid ticket ID for a valid payload', async ({
        request,
    }) => {
        const response = await request.post(ENDPOINT, {
            data: VALID_REPAIR_REQUEST,
        });

        // Assert — status 201 Created
        expect(response.status()).toBe(201);

        // Assert — response body structure
        const body = await response.json();
        expect(body.status).toBe('created');
        expect(body.message).toBe('Repair request submitted successfully');
        expect(body.ticketId).toMatch(UUID_V4_REGEX);
    });

    test('POST /api/repair-requests — should return a unique ticket ID for each request', async ({
        request,
    }) => {
        const response1 = await request.post(ENDPOINT, { data: VALID_REPAIR_REQUEST });
        const response2 = await request.post(ENDPOINT, { data: ALTERNATE_REPAIR_REQUEST });

        const body1 = await response1.json();
        const body2 = await response2.json();

        // Assert — both succeed
        expect(response1.status()).toBe(201);
        expect(response2.status()).toBe(201);

        // Assert — ticket IDs are unique
        expect(body1.ticketId).not.toBe(body2.ticketId);
    });

    test('POST /api/repair-requests — should return 400 with errors for missing required fields', async ({
        request,
    }) => {
        const response = await request.post(ENDPOINT, {
            data: {}, // Empty body
        });

        // Assert — status 400 Bad Request
        expect(response.status()).toBe(400);

        // Assert — error response structure
        const body = await response.json();
        expect(body.status).toBe('error');
        expect(body.message).toBe('Validation failed');
        expect(body.errors).toBeInstanceOf(Array);
        expect(body.errors.length).toBeGreaterThanOrEqual(5);

        // Assert — each required field has a validation error
        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('address');
        expect(errorFields).toContain('issueType');
        expect(errorFields).toContain('priority');
        expect(errorFields).toContain('description');
    });

    test('POST /api/repair-requests — should return 400 for partial payload', async ({
        request,
    }) => {
        const response = await request.post(ENDPOINT, {
            data: { name: 'Jan de Vries', address: 'Keizersgracht 123' },
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.errors.length).toBeGreaterThanOrEqual(3);

        // Name and address should NOT appear in errors
        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).not.toContain('name');
        expect(errorFields).not.toContain('address');
    });

    test('GET /api/health — should return 200 with status ok', async ({
        request,
    }) => {
        const response = await request.get(`${API_BASE_URL}/api/health`);

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.status).toBe('ok');
        expect(body.timestamp).toBeTruthy();
    });
});

/**
 * API Tests — Tickets (List & Detail)
 */
test.describe('Tickets API — List & Detail', () => {
    const ENDPOINT = `${API_BASE_URL}/api/repair-requests`;

    test('GET /api/repair-requests — should return the tickets array', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.tickets).toBeInstanceOf(Array);
    });

    test('GET /api/repair-requests/:id — should return a ticket by ID', async ({ request }) => {
        // Create a ticket first
        const createRes = await request.post(ENDPOINT, { data: VALID_REPAIR_REQUEST });
        const { ticketId } = await createRes.json();

        // Fetch it by ID
        const response = await request.get(`${ENDPOINT}/${ticketId}`);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.ticket.id).toBe(ticketId);
        expect(body.ticket.name).toBe(VALID_REPAIR_REQUEST.name);
        expect(body.ticket.status).toBe('Open');
        expect(body.ticket.assignedWorker).toBeNull();
    });

    test('GET /api/repair-requests/:id — should return 404 for non-existent ticket', async ({ request }) => {
        const response = await request.get(`${ENDPOINT}/non-existent-id`);
        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.message).toBe('Ticket not found');
    });
});

/**
 * API Tests — Workers CRUD
 */
test.describe('Workers API — CRUD', () => {
    const ENDPOINT = `${API_BASE_URL}/api/workers`;

    test('POST /api/workers — should create a worker and return 201', async ({ request }) => {
        const response = await request.post(ENDPOINT, {
            data: { name: 'Erik de Jong', specialization: 'Electrician' },
        });

        expect(response.status()).toBe(201);

        const body = await response.json();
        expect(body.worker.name).toBe('Erik de Jong');
        expect(body.worker.specialization).toBe('Electrician');
        expect(body.worker.id).toMatch(UUID_V4_REGEX);
    });

    test('POST /api/workers — should return 400 for missing fields', async ({ request }) => {
        const response = await request.post(ENDPOINT, { data: {} });
        expect(response.status()).toBe(400);

        const body = await response.json();
        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('specialization');
    });

    test('GET /api/workers — should return the workers array', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.workers).toBeInstanceOf(Array);
    });

    test('DELETE /api/workers/:id — should delete a worker', async ({ request }) => {
        // Create then delete
        const createRes = await request.post(ENDPOINT, {
            data: { name: 'Temp Worker', specialization: 'General' },
        });
        const { worker } = await createRes.json();

        const deleteRes = await request.delete(`${ENDPOINT}/${worker.id}`);
        expect(deleteRes.status()).toBe(200);

        const body = await deleteRes.json();
        expect(body.status).toBe('deleted');
    });

    test('DELETE /api/workers/:id — should return 404 for non-existent worker', async ({ request }) => {
        const response = await request.delete(`${ENDPOINT}/non-existent-id`);
        expect(response.status()).toBe(404);
    });
});

/**
 * API Tests — Ticket Assignment
 */
test.describe('Ticket Assignment API', () => {
    test('PATCH /api/repair-requests/:id/assign — should assign a worker to a ticket', async ({ request }) => {
        // Create ticket and worker
        const ticketRes = await request.post(`${API_BASE_URL}/api/repair-requests`, {
            data: VALID_REPAIR_REQUEST,
        });
        const { ticketId } = await ticketRes.json();

        const workerRes = await request.post(`${API_BASE_URL}/api/workers`, {
            data: { name: 'Assign Test Worker', specialization: 'Plumber' },
        });
        const { worker } = await workerRes.json();

        // Assign worker to ticket
        const assignRes = await request.patch(`${API_BASE_URL}/api/repair-requests/${ticketId}/assign`, {
            data: { workerId: worker.id },
        });

        expect(assignRes.status()).toBe(200);

        const body = await assignRes.json();
        expect(body.ticket.status).toBe('Assigned');
        expect(body.ticket.assignedWorker.id).toBe(worker.id);
        expect(body.ticket.assignedWorker.name).toBe('Assign Test Worker');
    });

    test('PATCH /api/repair-requests/:id/assign — should return 400 without workerId', async ({ request }) => {
        const ticketRes = await request.post(`${API_BASE_URL}/api/repair-requests`, {
            data: VALID_REPAIR_REQUEST,
        });
        const { ticketId } = await ticketRes.json();

        const response = await request.patch(`${API_BASE_URL}/api/repair-requests/${ticketId}/assign`, {
            data: {},
        });

        expect(response.status()).toBe(400);
    });
});

