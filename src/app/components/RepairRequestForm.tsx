import { useState } from 'react';
import { ISSUE_TYPES, PRIORITIES, API_BASE_URL } from '../../shared/constants';
import type { RepairRequest, RepairResponse, FormErrors } from '../types/RepairRequest';
import SuccessMessage from './SuccessMessage';

/** Initial empty form state. */
const INITIAL_FORM_STATE: RepairRequest = {
    name: '',
    address: '',
    issueType: '',
    priority: '',
    description: '',
};

/**
 * Validates all form fields and returns an errors object.
 * Returns an empty object if all fields are valid.
 */
function validateForm(data: RepairRequest): FormErrors {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
        errors.name = 'Name is required';
    }
    if (!data.address.trim()) {
        errors.address = 'Address is required';
    }
    if (!data.issueType) {
        errors.issueType = 'Issue type is required';
    }
    if (!data.priority) {
        errors.priority = 'Priority is required';
    }
    if (!data.description.trim()) {
        errors.description = 'Description is required';
    }

    return errors;
}

/**
 * RepairRequestForm component.
 * Handles the complete lifecycle of submitting a tenant repair request:
 * client-side validation → API submission → success/error feedback.
 */
function RepairRequestForm() {
    const [formData, setFormData] = useState<RepairRequest>(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [response, setResponse] = useState<RepairResponse | null>(null);

    /** Updates a single form field. */
    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear field error on change
        if (errors[name as keyof RepairRequest]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name as keyof RepairRequest];
                return next;
            });
        }
    }

    /** Handles form submission with validation and API call. */
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSubmitError(null);

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/repair-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorBody = await res.json();
                throw new Error(errorBody.message || 'Failed to submit repair request');
            }

            const data: RepairResponse = await res.json();
            setResponse(data);
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'An unexpected error occurred',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    /** Resets the form to allow a new submission. */
    function handleNewRequest() {
        setFormData(INITIAL_FORM_STATE);
        setErrors({});
        setResponse(null);
        setSubmitError(null);
    }

    // Show success message after successful submission
    if (response) {
        return (
            <SuccessMessage
                ticketId={response.ticketId}
                onNewRequest={handleNewRequest}
            />
        );
    }

    /** Shared input styling. */
    const inputBase =
        'w-full rounded-lg border bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500';
    const inputNormal = `${inputBase} border-slate-600/50 hover:border-slate-500`;
    const inputError = `${inputBase} border-red-500/70 focus:ring-red-500/50 focus:border-red-500`;

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="repair-request-form"
            className="rounded-2xl border border-slate-700/50 bg-[var(--color-card)] p-8 shadow-2xl shadow-black/20 backdrop-blur-sm"
        >
            {/* Submission Error Banner */}
            {submitError && (
                <div
                    data-testid="submit-error"
                    className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    role="alert"
                >
                    {submitError}
                </div>
            )}

            {/* Name */}
            <div className="mb-5">
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Full Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jan de Vries"
                    className={errors.name ? inputError : inputNormal}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    data-testid="input-name"
                />
                {errors.name && (
                    <p id="name-error" data-testid="error-name" className="mt-1.5 text-xs text-red-400">
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Address */}
            <div className="mb-5">
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Property Address
                </label>
                <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Keizersgracht 123, 1015 CJ Amsterdam"
                    className={errors.address ? inputError : inputNormal}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                    data-testid="input-address"
                />
                {errors.address && (
                    <p id="address-error" data-testid="error-address" className="mt-1.5 text-xs text-red-400">
                        {errors.address}
                    </p>
                )}
            </div>

            {/* Issue Type & Priority — side by side */}
            <div className="mb-5 grid grid-cols-2 gap-4">
                {/* Issue Type */}
                <div>
                    <label htmlFor="issueType" className="mb-1.5 block text-sm font-medium text-slate-300">
                        Issue Type
                    </label>
                    <select
                        id="issueType"
                        name="issueType"
                        value={formData.issueType}
                        onChange={handleChange}
                        className={errors.issueType ? inputError : inputNormal}
                        aria-invalid={!!errors.issueType}
                        aria-describedby={errors.issueType ? 'issueType-error' : undefined}
                        data-testid="select-issueType"
                    >
                        <option value="" disabled>
                            Select type…
                        </option>
                        {ISSUE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    {errors.issueType && (
                        <p id="issueType-error" data-testid="error-issueType" className="mt-1.5 text-xs text-red-400">
                            {errors.issueType}
                        </p>
                    )}
                </div>

                {/* Priority */}
                <div>
                    <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-slate-300">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className={errors.priority ? inputError : inputNormal}
                        aria-invalid={!!errors.priority}
                        aria-describedby={errors.priority ? 'priority-error' : undefined}
                        data-testid="select-priority"
                    >
                        <option value="" disabled>
                            Select priority…
                        </option>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    {errors.priority && (
                        <p id="priority-error" data-testid="error-priority" className="mt-1.5 text-xs text-red-400">
                            {errors.priority}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Description of the Issue
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail…"
                    className={errors.description ? inputError : inputNormal}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'description-error' : undefined}
                    data-testid="textarea-description"
                />
                {errors.description && (
                    <p id="description-error" data-testid="error-description" className="mt-1.5 text-xs text-red-400">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-button"
                className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 hover:shadow-brand-500/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                    </span>
                ) : (
                    'Submit Repair Request'
                )}
            </button>
        </form>
    );
}

export default RepairRequestForm;
