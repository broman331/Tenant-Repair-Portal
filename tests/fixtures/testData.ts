/**
 * Reusable test data for the Repair Request test suite.
 * Centralizes test constants to avoid duplication across spec files.
 */

/** A valid repair request payload for the "green path" scenario. */
export const VALID_REPAIR_REQUEST = {
    name: 'Jan de Vries',
    address: 'Keizersgracht 123, 1015 CJ Amsterdam',
    issueType: 'Plumbing',
    priority: 'High',
    description: 'The kitchen faucet has been leaking for two days. Water is pooling under the sink cabinet.',
} as const;

/** A second valid request for variation testing. */
export const ALTERNATE_REPAIR_REQUEST = {
    name: 'Maria Jansen',
    address: 'Prinsengracht 456, 1016 HK Amsterdam',
    issueType: 'Electrical',
    priority: 'Urgent',
    description: 'Frequent power outages in the living room circuit. Lights flicker before going off entirely.',
} as const;

/** UUID v4 regex pattern for validating ticket IDs. */
export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Base URL for direct API testing. */
export const API_BASE_URL = 'http://localhost:4000';
