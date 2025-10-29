/**
 * Global timeout configuration
 */

// Default timeouts in milliseconds
export const TIMEOUTS = {
    DEFAULT: 10000,        // 10 seconds
    SHORT: 5000,          // 5 seconds
    LONG: 30000,          // 30 seconds
    VERY_LONG: 60000,     // 60 seconds
    ELEMENT_VISIBLE: 10000,    // 10 seconds for element visibility
    ELEMENT_ENABLED: 10000,    // 10 seconds for element enabled state
    PAGE_LOAD: 30000,     // 30 seconds for page load
    API_CALL: 30000,      // 30 seconds for API calls
    NAVIGATION: 15000,    // 15 seconds for navigation
    WAIT_FOR: 10000       // 10 seconds for general wait operations
};

/**
 * Get timeout value
 * @param {string} type - Timeout type
 * @returns {number} Timeout in milliseconds
 */
export function getTimeout(type = 'DEFAULT') {
    return TIMEOUTS[type] || TIMEOUTS.DEFAULT;
}

/**
 * Set custom timeout
 * @param {string} type - Timeout type
 * @param {number} value - Timeout value in milliseconds
 */
export function setTimeout(type, value) {
    TIMEOUTS[type] = value;
}
