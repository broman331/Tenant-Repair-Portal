import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../shared/constants';
import type { Ticket, Worker } from '../types/RepairRequest';

/** Priority color mapping. */
const PRIORITY_COLORS: Record<string, string> = {
    Low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    High: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
};

/** Status color mapping. */
const STATUS_COLORS: Record<string, string> = {
    Open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Assigned: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'In Progress': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

/**
 * TicketDetail component.
 * Displays full ticket information and allows worker assignment.
 */
function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignMessage, setAssignMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ticketRes, workersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/repair-requests/${id}`),
                    fetch(`${API_BASE_URL}/api/workers`),
                ]);

                if (!ticketRes.ok) throw new Error('Ticket not found');

                const ticketData = await ticketRes.json();
                const workersData = await workersRes.json();

                setTicket(ticketData.ticket);
                setWorkers(workersData.workers);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        void fetchData();
    }, [id]);

    async function handleAssign() {
        if (!selectedWorkerId || !id) return;

        setIsAssigning(true);
        setAssignMessage(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/repair-requests/${id}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workerId: selectedWorkerId }),
            });

            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.message || 'Failed to assign worker');
            }

            const data = await res.json();
            setTicket(data.ticket);
            setAssignMessage(data.message);
            setSelectedWorkerId('');
        } catch (err) {
            setAssignMessage(err instanceof Error ? err.message : 'Assignment failed');
        } finally {
            setIsAssigning(false);
        }
    }

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

    if (error || !ticket) {
        return (
            <div data-testid="error-message" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                {error ?? 'Ticket not found'}
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
                <Link to="/tickets" className="hover:text-brand-400 transition-colors">Tickets</Link>
                <span>›</span>
                <span className="font-mono text-slate-300">{ticket.id.slice(0, 8)}…</span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Ticket Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                                {ticket.priority}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[ticket.status] ?? ''}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <h1 className="mb-1 text-xl font-bold text-white" data-testid="ticket-issue-type">
                            {ticket.issueType} Issue
                        </h1>
                        <p className="text-sm text-slate-400">
                            Submitted on {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Details Card */}
                    <div className="rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6 space-y-5">
                        <div>
                            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Tenant Name</h3>
                            <p className="text-slate-200" data-testid="ticket-name">{ticket.name}</p>
                        </div>
                        <div>
                            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Property Address</h3>
                            <p className="text-slate-200" data-testid="ticket-address">{ticket.address}</p>
                        </div>
                        <div>
                            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Description</h3>
                            <p className="text-slate-300 leading-relaxed" data-testid="ticket-description">{ticket.description}</p>
                        </div>
                    </div>

                    {/* Ticket ID */}
                    <div className="rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6">
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Ticket ID</h3>
                        <p className="font-mono text-sm text-brand-400" data-testid="ticket-id">{ticket.id}</p>
                    </div>
                </div>

                {/* Sidebar — Assignment */}
                <div className="space-y-6">
                    {/* Current Assignment */}
                    <div className="rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6">
                        <h2 className="mb-4 text-sm font-semibold text-white">Assigned Worker</h2>
                        {ticket.assignedWorker ? (
                            <div data-testid="assigned-worker" className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-3">
                                <p className="font-medium text-slate-200" data-testid="assigned-worker-name">
                                    {ticket.assignedWorker.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400" data-testid="assigned-worker-spec">
                                    {ticket.assignedWorker.specialization}
                                </p>
                            </div>
                        ) : (
                            <p data-testid="no-worker" className="text-sm text-slate-500 italic">
                                No worker assigned yet
                            </p>
                        )}
                    </div>

                    {/* Assign Worker Form */}
                    <div className="rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6">
                        <h2 className="mb-4 text-sm font-semibold text-white">Assign Worker</h2>

                        {workers.length === 0 ? (
                            <div className="text-sm text-slate-500">
                                <p className="mb-2">No workers available.</p>
                                <Link to="/workers" className="text-brand-400 hover:text-brand-300 hover:underline">
                                    Add workers →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <select
                                    value={selectedWorkerId}
                                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                                    data-testid="assign-worker-select"
                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                >
                                    <option value="">Select a worker…</option>
                                    {workers.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} — {w.specialization}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedWorkerId || isAssigning}
                                    data-testid="assign-worker-button"
                                    className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isAssigning ? 'Assigning…' : 'Assign'}
                                </button>

                                {assignMessage && (
                                    <p data-testid="assign-message" className="text-xs text-emerald-400">
                                        {assignMessage}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TicketDetail;
