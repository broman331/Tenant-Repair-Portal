import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Tenant Repair Request Portal.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    workers: process.env['CI'] ? 1 : undefined,
    reporter: [['html', { open: 'never' }], ['list']],

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /**
     * Automatically start the API and frontend dev servers before running tests.
     * Playwright will wait until both servers are ready.
     */
    webServer: [
        {
            command: 'npx tsx src/api/server.ts',
            port: 4000,
            reuseExistingServer: !process.env['CI'],
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: 'npx vite',
            port: 3000,
            reuseExistingServer: !process.env['CI'],
            stdout: 'pipe',
            stderr: 'pipe',
        },
    ],
});
