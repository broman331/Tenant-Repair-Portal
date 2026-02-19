/**
 * TypeScript interfaces for Repair Request data structures.
 */

import type { IssueType, Priority, Specialization, TicketStatus } from '../../shared/constants';

/** Shape of a repair request submitted by a tenant. */
export interface RepairRequest {
    name: string;
    address: string;
    issueType: IssueType | '';
    priority: Priority | '';
    description: string;
}

/** Shape of the API response after a successful submission. */
export interface RepairResponse {
    ticketId: string;
    status: string;
    message: string;
}

/** A stored ticket with metadata. */
export interface Ticket {
    id: string;
    name: string;
    address: string;
    issueType: IssueType;
    priority: Priority;
    description: string;
    status: TicketStatus;
    assignedWorker: Worker | null;
    createdAt: string;
}

/** A maintenance worker. */
export interface Worker {
    id: string;
    name: string;
    specialization: Specialization;
}

/** Validation errors keyed by field name. */
export type FormErrors = Partial<Record<keyof RepairRequest, string>>;
