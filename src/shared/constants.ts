/**
 * Shared constants for the Tenant Repair Request Portal.
 * Used by both the frontend and API to ensure consistency.
 */

/** Available issue types for repair requests. */
export const ISSUE_TYPES = [
    'Plumbing',
    'Electrical',
    'Structural',
    'Heating',
    'Other',
] as const;

/** Priority levels for repair requests. */
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

/** Worker specialization categories. */
export const SPECIALIZATIONS = [
    'Plumber',
    'Electrician',
    'Carpenter',
    'HVAC Technician',
    'General',
] as const;

/** Ticket lifecycle statuses. */
export const TICKET_STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved'] as const;

/** Type aliases derived from the const arrays. */
export type IssueType = (typeof ISSUE_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Specialization = (typeof SPECIALIZATIONS)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** API configuration. */
export const API_BASE_URL = 'http://localhost:4000';
export const API_PORT = 4000;
export const FRONTEND_PORT = 3000;
