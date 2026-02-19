import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../shared/constants';
import type { Ticket } from '../types/RepairRequest';

/** Priority color mapping for visual badges. */
const PRIORITY_COLORS: Record<string, string> = {
    Low: 'bg-slate-500/20 text-slate-300',
    Medium: 'bg-amber-500/20 text-amber-300',
    High: 'bg-orange-500/20 text-orange-300',
    Urgent: 'bg-red-500/20 text-red-300',
};

/** Status color mapping. */
const STATUS_COLORS: Record<string, string> = {
    Open: 'bg-blue-500/20 text-blue-300',
    Assigned: 'bg-purple-500/20 text-purple-300',
    'In Progress': 'bg-yellow-500/20 text-yellow-300',
    Resolved: 'bg-emerald-500/20 text-emerald-300',
};

/**
 * TicketList component.
 * Displays all submitted repair tickets in a table format.
 */
function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTickets() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/repair-requests`);
                if (!res.ok) throw new Error('Failed to fetch tickets');
                const data = await res.json();
                setTickets(data.tickets);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        void fetchTickets();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
                <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div data-testid="error-message" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tickets</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {tickets.length} repair {tickets.length === 1 ? 'request' : 'requests'} submitted
                    </p>
                </div>
                <Link
                    to="/"
                    data-testid="btn-new-request"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500"
                >
                    + New Request
                </Link>
            </div>

            {/* Empty State */}
            {tickets.length === 0 ? (
                <div
                    data-testid="empty-state"
                    className="rounded-2xl border border-slate-700/50 bg-[var(--color-card)] p-12 text-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="mb-2 text-lg font-semibold text-slate-300">No tickets yet</h2>
                    <p className="text-sm text-slate-500">Submit your first repair request to get started.</p>
                </div>
            ) : (
                /* Ticket Table */
                <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-[var(--color-card)]">
                    <table className="w-full text-sm" data-testid="ticket-table">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-3">Ticket</th>
                                <th className="px-5 py-3">Tenant</th>
                                <th className="px-5 py-3">Issue</th>
                                <th className="px-5 py-3">Priority</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Assigned To</th>
                                <th className="px-5 py-3">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="transition-colors hover:bg-slate-700/20"
                                    data-testid={`ticket-row-${ticket.id}`}
                                >
                                    <td className="px-5 py-3.5">
                                        <Link
                                            to={`/tickets/${ticket.id}`}
                                            className="font-mono text-xs text-brand-400 hover:text-brand-300 hover:underline"
                                            data-testid={`ticket-link-${ticket.id}`}
                                        >
                                            {ticket.id.slice(0, 8)}…
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-200">{ticket.name}</td>
                                    <td className="px-5 py-3.5 text-slate-300">{ticket.issueType}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] ?? ''}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-400">
                                        {ticket.assignedWorker ? ticket.assignedWorker.name : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TicketList;
