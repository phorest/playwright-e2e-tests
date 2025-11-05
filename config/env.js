/**
 * Environment configuration
 */

/**
 * Environment class
 */
export class Env {
    constructor({
                    name,
                    baseUrl,
                    appOrigin,
                    apiGateway,
                    businessId,
                    branchId,
                    staffEmail,
                    staffPassword,
                    headed = true
                }) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.appOrigin = appOrigin;
        this.apiGateway = apiGateway;
        this.businessId = businessId;
        this.branchId = branchId;
        this.staffEmail = staffEmail;
        this.staffPassword = staffPassword;
        this.headed = headed;
    }
}

// Development environment
export const DEV = new Env({
    name: "dev",
    baseUrl: "https://my-dev.phorest.com",
    appOrigin: "https://app-dev.phorest.com",
    apiGateway: "https://api-gateway-dev.phorest.com",
    businessId: "okZVIi6pKyOe7LwzTTiWwg",
    branchId: "ooPWjXsoYnvR1X9k7qmkIg",
    staffEmail: "mateusz.wlodek+owner@phorest.com",
    staffPassword: "Test123",
    headed: true,
});

// Production environment
export const PROD = new Env({
    name: "prod",
    baseUrl: "https://my.phorest.com",
    appOrigin: "https://my.phorest.com",
    apiGateway: "https://api-gateway-eu.phorest.com",
    businessId: "GIqneoR8AJg9t-2F23_vJw",
    branchId: "SgvKUxC4FKNUPUYw2mF9AQ",
    staffEmail: "mateusz.wlodek+owner@phorest.com",
    staffPassword: "Test123",
    headed: true,
});

// Available environments
export const ENVS = { dev: DEV, prod: PROD };

/**
 * Get environment by name
 * @param {string} name - Environment name
 * @returns {Env} Environment
 */
export function getEnv(name) {
    if (!ENVS[name]) {
        throw new Error(`Unknown env '${name}'. Use one of: ${Object.keys(ENVS).join(', ')}`);
    }
    return ENVS[name];
}
