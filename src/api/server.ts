/**
 * Mock REST API for the Tenant Repair Request Portal.
 *
 * Endpoints:
 *   POST   /api/repair-requests          — Submit a new repair request
 *   GET    /api/repair-requests          — List all tickets
 *   GET    /api/repair-requests/:id      — Get ticket by ID
 *   PATCH  /api/repair-requests/:id/assign — Assign a worker to a ticket
 *   GET    /api/workers                  — List all workers
 *   POST   /api/workers                  — Create a worker
 *   DELETE /api/workers/:id              — Remove a worker
 *   GET    /api/health                   — Health check
 *
 * Runs on port 4000 by default (configurable via API_PORT).
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { v4 as uuidV4 } from 'uuid';

const API_PORT = Number(process.env['API_PORT']) || 4000;
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] || 'http://localhost:3000';

const app = express();

// -------------------------------------------------------------------
// Middleware
// -------------------------------------------------------------------
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface RepairRequestBody {
    name?: string;
    address?: string;
    issueType?: string;
    priority?: string;
    description?: string;
}

interface WorkerBody {
    name?: string;
    specialization?: string;
}

interface AssignBody {
    workerId?: string;
}

interface StoredTicket {
    id: string;
    name: string;
    address: string;
    issueType: string;
    priority: string;
    description: string;
    status: string;
    assignedWorker: StoredWorker | null;
    createdAt: string;
}

interface StoredWorker {
    id: string;
    name: string;
    specialization: string;
}

interface ValidationError {
    field: string;
    message: string;
}

// -------------------------------------------------------------------
// In-Memory Data Store
// -------------------------------------------------------------------
const tickets: StoredTicket[] = [];
const workers: StoredWorker[] = [];

// -------------------------------------------------------------------
// Validation Constants
// -------------------------------------------------------------------
const VALID_ISSUE_TYPES = ['Plumbing', 'Electrical', 'Structural', 'Heating', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const VALID_SPECIALIZATIONS = ['Plumber', 'Electrician', 'Carpenter', 'HVAC Technician', 'General'];

// -------------------------------------------------------------------
// Validation Helpers
// -------------------------------------------------------------------
function validateRepairRequest(body: RepairRequestBody): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!body.name?.trim()) {
        errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!body.address?.trim()) {
        errors.push({ field: 'address', message: 'Address is required' });
    }
    if (!body.issueType || !VALID_ISSUE_TYPES.includes(body.issueType)) {
        errors.push({
            field: 'issueType',
            message: `Issue type must be one of: ${VALID_ISSUE_TYPES.join(', ')}`,
        });
    }
    if (!body.priority || !VALID_PRIORITIES.includes(body.priority)) {
        errors.push({
            field: 'priority',
            message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
        });
    }
    if (!body.description?.trim()) {
        errors.push({ field: 'description', message: 'Description is required' });
    }

    return errors;
}

function validateWorker(body: WorkerBody): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!body.name?.trim()) {
        errors.push({ field: 'name', message: 'Worker name is required' });
    }
    if (!body.specialization || !VALID_SPECIALIZATIONS.includes(body.specialization)) {
        errors.push({
            field: 'specialization',
            message: `Specialization must be one of: ${VALID_SPECIALIZATIONS.join(', ')}`,
        });
    }

    return errors;
}

// -------------------------------------------------------------------
// Routes — Health
// -------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------------
// Routes — Repair Requests (Tickets)
// -------------------------------------------------------------------

/** List all tickets. */
app.get('/api/repair-requests', (_req: Request, res: Response) => {
    res.json({ tickets });
});

/** Get a single ticket by ID. */
app.get('/api/repair-requests/:id', (req: Request, res: Response) => {
    const ticket = tickets.find((t) => t.id === req.params['id']);

    if (!ticket) {
        res.status(404).json({ status: 'error', message: 'Ticket not found' });
        return;
    }

    res.json({ ticket });
});

/** Submit a new repair request. */
app.post('/api/repair-requests', (req: Request, res: Response) => {
    const body = req.body as RepairRequestBody;
    const errors = validateRepairRequest(body);

    if (errors.length > 0) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors });
        return;
    }

    const ticket: StoredTicket = {
        id: uuidV4(),
        name: body.name!.trim(),
        address: body.address!.trim(),
        issueType: body.issueType!,
        priority: body.priority!,
        description: body.description!.trim(),
        status: 'Open',
        assignedWorker: null,
        createdAt: new Date().toISOString(),
    };

    tickets.push(ticket);

    console.log(
        JSON.stringify({
            event: 'repair_request_created',
            ticketId: ticket.id,
            name: ticket.name,
            address: ticket.address,
            issueType: ticket.issueType,
            priority: ticket.priority,
            timestamp: ticket.createdAt,
        }),
    );

    res.status(201).json({
        status: 'created',
        message: 'Repair request submitted successfully',
        ticketId: ticket.id,
    });
});

/** Assign a worker to a ticket. */
app.patch('/api/repair-requests/:id/assign', (req: Request, res: Response) => {
    const ticket = tickets.find((t) => t.id === req.params['id']);

    if (!ticket) {
        res.status(404).json({ status: 'error', message: 'Ticket not found' });
        return;
    }

    const { workerId } = req.body as AssignBody;

    if (!workerId) {
        res.status(400).json({ status: 'error', message: 'workerId is required' });
        return;
    }

    const worker = workers.find((w) => w.id === workerId);

    if (!worker) {
        res.status(404).json({ status: 'error', message: 'Worker not found' });
        return;
    }

    ticket.assignedWorker = { ...worker };
    ticket.status = 'Assigned';

    console.log(
        JSON.stringify({
            event: 'ticket_assigned',
            ticketId: ticket.id,
            workerId: worker.id,
            workerName: worker.name,
            timestamp: new Date().toISOString(),
        }),
    );

    res.json({
        status: 'updated',
        message: `Ticket assigned to ${worker.name}`,
        ticket,
    });
});

// -------------------------------------------------------------------
// Routes — Workers
// -------------------------------------------------------------------

/** List all workers. */
app.get('/api/workers', (_req: Request, res: Response) => {
    res.json({ workers });
});

/** Create a new worker. */
app.post('/api/workers', (req: Request, res: Response) => {
    const body = req.body as WorkerBody;
    const errors = validateWorker(body);

    if (errors.length > 0) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors });
        return;
    }

    const worker: StoredWorker = {
        id: uuidV4(),
        name: body.name!.trim(),
        specialization: body.specialization!,
    };

    workers.push(worker);

    console.log(
        JSON.stringify({
            event: 'worker_created',
            workerId: worker.id,
            name: worker.name,
            specialization: worker.specialization,
            timestamp: new Date().toISOString(),
        }),
    );

    res.status(201).json({
        status: 'created',
        message: 'Worker created successfully',
        worker,
    });
});

/** Delete a worker by ID. */
app.delete('/api/workers/:id', (req: Request, res: Response) => {
    const index = workers.findIndex((w) => w.id === req.params['id']);

    if (index === -1) {
        res.status(404).json({ status: 'error', message: 'Worker not found' });
        return;
    }

    const [removed] = workers.splice(index, 1);

    console.log(
        JSON.stringify({
            event: 'worker_deleted',
            workerId: removed!.id,
            name: removed!.name,
            timestamp: new Date().toISOString(),
        }),
    );

    res.json({ status: 'deleted', message: 'Worker removed successfully' });
});

// -------------------------------------------------------------------
// Server Start
// -------------------------------------------------------------------
const server = app.listen(API_PORT, () => {
    console.log(`🔧 Repair Request API running on http://localhost:${API_PORT}`);
});

export { app, server };
