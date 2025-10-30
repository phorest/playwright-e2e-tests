/**
 * Runtime configuration
 */

import { Env, DEV, getEnv } from './env.js';

// Active environment - equivalent to Python ACTIVE_ENV
let ACTIVE_ENV = DEV;

/**
 * Set runtime environment - equivalent to Python set_runtime function
 * @param {Env} env - Environment to set
 */
export function setRuntime(env) {
    ACTIVE_ENV = env;
}

/**
 * Set active environment by name - convenience function
 * @param {string} envName - Environment name
 */
export function setActiveEnv(envName) {
    const env = getEnv(envName);
    ACTIVE_ENV = env;
    console.log(`🌍 Environment set to: ${envName}`);
}

/**
 * Get active environment - equivalent to Python ACTIVE_ENV
 * @returns {Env} Active environment
 */
export function getActiveEnv() {
    return ACTIVE_ENV;
}

// Export DEV for convenience
export { DEV, getEnv };
