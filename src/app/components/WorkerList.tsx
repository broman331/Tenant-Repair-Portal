import { useEffect, useState } from 'react';
import { API_BASE_URL, SPECIALIZATIONS } from '../../shared/constants';
import type { Worker } from '../types/RepairRequest';

/**
 * WorkerList component.
 * Displays all workers and provides an inline form to add new ones.
 */
function WorkerList() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add-worker form state
    const [newName, setNewName] = useState('');
    const [newSpec, setNewSpec] = useState('');
    const [addError, setAddError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    async function fetchWorkers() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/workers`);
            if (!res.ok) throw new Error('Failed to fetch workers');
            const data = await res.json();
            setWorkers(data.workers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchWorkers();
    }, []);

    async function handleAddWorker(e: React.FormEvent) {
        e.preventDefault();
        setAddError(null);

        if (!newName.trim()) {
            setAddError('Worker name is required');
            return;
        }
        if (!newSpec) {
            setAddError('Specialization is required');
            return;
        }

        setIsAdding(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/workers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim(), specialization: newSpec }),
            });

            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.message || 'Failed to add worker');
            }

            const data = await res.json();
            setWorkers((prev) => [...prev, data.worker]);
            setNewName('');
            setNewSpec('');
        } catch (err) {
            setAddError(err instanceof Error ? err.message : 'Failed to add worker');
        } finally {
            setIsAdding(false);
        }
    }

    async function handleDeleteWorker(workerId: string) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/workers/${workerId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete worker');

            setWorkers((prev) => prev.filter((w) => w.id !== workerId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete worker');
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

    if (error) {
        return (
            <div data-testid="error-message" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                {error}
            </div>
        );
    }

    /** Specialization color mapping. */
    const SPEC_COLORS: Record<string, string> = {
        Plumber: 'bg-cyan-500/20 text-cyan-300',
        Electrician: 'bg-yellow-500/20 text-yellow-300',
        Carpenter: 'bg-amber-500/20 text-amber-300',
        'HVAC Technician': 'bg-sky-500/20 text-sky-300',
        General: 'bg-slate-500/20 text-slate-300',
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Workers</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Manage maintenance workers available for ticket assignment.
                </p>
            </div>

            {/* Add Worker Form */}
            <form
                onSubmit={handleAddWorker}
                data-testid="add-worker-form"
                className="mb-6 rounded-xl border border-slate-700/50 bg-[var(--color-card)] p-6"
            >
                <h2 className="mb-4 text-sm font-semibold text-white">Add New Worker</h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Worker name"
                        data-testid="input-worker-name"
                        className="flex-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                    <select
                        value={newSpec}
                        onChange={(e) => setNewSpec(e.target.value)}
                        data-testid="select-worker-specialization"
                        className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    >
                        <option value="">Specialization…</option>
                        {SPECIALIZATIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={isAdding}
                        data-testid="btn-add-worker"
                        className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 disabled:opacity-60"
                    >
                        {isAdding ? 'Adding…' : 'Add Worker'}
                    </button>
                </div>

                {addError && (
                    <p data-testid="add-worker-error" className="mt-2 text-xs text-red-400">{addError}</p>
                )}
            </form>

            {/* Workers Table */}
            {workers.length === 0 ? (
                <div
                    data-testid="empty-state"
                    className="rounded-2xl border border-slate-700/50 bg-[var(--color-card)] p-12 text-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <h2 className="mb-2 text-lg font-semibold text-slate-300">No workers yet</h2>
                    <p className="text-sm text-slate-500">Add your first worker using the form above.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-[var(--color-card)]">
                    <table className="w-full text-sm" data-testid="worker-table">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Specialization</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {workers.map((worker) => (
                                <tr
                                    key={worker.id}
                                    className="transition-colors hover:bg-slate-700/20"
                                    data-testid={`worker-row-${worker.id}`}
                                >
                                    <td className="px-5 py-3.5 font-medium text-slate-200" data-testid={`worker-name-${worker.id}`}>
                                        {worker.name}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${SPEC_COLORS[worker.specialization] ?? ''}`}>
                                            {worker.specialization}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => handleDeleteWorker(worker.id)}
                                            data-testid={`btn-delete-worker-${worker.id}`}
                                            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                                        >
                                            Delete
                                        </button>
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

export default WorkerList;
