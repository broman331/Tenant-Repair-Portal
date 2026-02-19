import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Repair Request page.
 *
 * Encapsulates all locators and interactions for the repair request form,
 * following Playwright best practices and the POM design pattern.
 *
 * @see https://playwright.dev/docs/pom
 */
export class RepairRequestPage {
    // -------------------------------------------------------------------
    // Locators — Form Inputs
    // -------------------------------------------------------------------
    readonly nameInput: Locator;
    readonly addressInput: Locator;
    readonly issueTypeSelect: Locator;
    readonly prioritySelect: Locator;
    readonly descriptionTextarea: Locator;
    readonly submitButton: Locator;

    // -------------------------------------------------------------------
    // Locators — Feedback
    // -------------------------------------------------------------------
    readonly successMessage: Locator;
    readonly ticketId: Locator;
    readonly newRequestButton: Locator;
    readonly submitError: Locator;

    // -------------------------------------------------------------------
    // Locators — Validation Errors
    // -------------------------------------------------------------------
    readonly errorName: Locator;
    readonly errorAddress: Locator;
    readonly errorIssueType: Locator;
    readonly errorPriority: Locator;
    readonly errorDescription: Locator;

    constructor(private readonly page: Page) {
        // Form inputs
        this.nameInput = page.getByTestId('input-name');
        this.addressInput = page.getByTestId('input-address');
        this.issueTypeSelect = page.getByTestId('select-issueType');
        this.prioritySelect = page.getByTestId('select-priority');
        this.descriptionTextarea = page.getByTestId('textarea-description');
        this.submitButton = page.getByTestId('submit-button');

        // Feedback elements
        this.successMessage = page.getByTestId('success-message');
        this.ticketId = page.getByTestId('ticket-id');
        this.newRequestButton = page.getByTestId('new-request-button');
        this.submitError = page.getByTestId('submit-error');

        // Validation error messages
        this.errorName = page.getByTestId('error-name');
        this.errorAddress = page.getByTestId('error-address');
        this.errorIssueType = page.getByTestId('error-issueType');
        this.errorPriority = page.getByTestId('error-priority');
        this.errorDescription = page.getByTestId('error-description');
    }

    /**
     * Navigate to the repair request page.
     */
    async goto(): Promise<void> {
        await this.page.goto('/');
    }

    /**
     * Fill the entire form with the provided data.
     */
    async fillForm(data: {
        name: string;
        address: string;
        issueType: string;
        priority: string;
        description: string;
    }): Promise<void> {
        await this.nameInput.fill(data.name);
        await this.addressInput.fill(data.address);
        await this.issueTypeSelect.selectOption(data.issueType);
        await this.prioritySelect.selectOption(data.priority);
        await this.descriptionTextarea.fill(data.description);
    }

    /**
     * Click the submit button.
     */
    async submit(): Promise<void> {
        await this.submitButton.click();
    }

    /**
     * Convenience: fill the form and submit in one call.
     */
    async fillAndSubmit(data: {
        name: string;
        address: string;
        issueType: string;
        priority: string;
        description: string;
    }): Promise<void> {
        await this.fillForm(data);
        await this.submit();
    }

    /**
     * Returns the text content of the ticket ID element.
     */
    async getTicketIdText(): Promise<string> {
        return (await this.ticketId.textContent()) ?? '';
    }

    /**
     * Returns the validation error locator for a specific field.
     */
    getFieldError(field: 'name' | 'address' | 'issueType' | 'priority' | 'description'): Locator {
        const errorMap: Record<string, Locator> = {
            name: this.errorName,
            address: this.errorAddress,
            issueType: this.errorIssueType,
            priority: this.errorPriority,
            description: this.errorDescription,
        };
        return errorMap[field]!;
    }
}
