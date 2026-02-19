import { Link } from 'react-router-dom';

/**
 * SuccessMessage component.
 * Displays a confirmation banner after a repair request is successfully submitted.
 */

interface SuccessMessageProps {
    /** The unique ticket ID returned by the API. */
    ticketId: string;
    /** Callback to reset the form for a new request. */
    onNewRequest: () => void;
}

function SuccessMessage({ ticketId, onNewRequest }: SuccessMessageProps) {
    return (
        <div
            data-testid="success-message"
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center backdrop-blur-sm"
            role="status"
            aria-live="polite"
        >
            {/* Success Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-emerald-300">
                Request Submitted Successfully
            </h2>

            <p className="mb-4 text-slate-400">
                Your repair request has been registered. A technician will be assigned shortly.
            </p>

            <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Ticket ID
                </p>
                <p
                    data-testid="ticket-id"
                    className="mt-1 font-mono text-lg font-bold text-brand-400"
                >
                    {ticketId}
                </p>
            </div>

            <div className="flex items-center justify-center gap-3">
                <Link
                    to={`/tickets/${ticketId}`}
                    data-testid="view-ticket-link"
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500"
                >
                    View Ticket
                </Link>
                <button
                    onClick={onNewRequest}
                    data-testid="new-request-button"
                    className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                    Submit Another Request
                </button>
            </div>
        </div>
    );
}

export default SuccessMessage;
