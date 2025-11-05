// tests/conftest.js
/**
 * JS version of pytest-style fixtures using Playwright Test
 */
import base from '@playwright/test';
import { setActiveEnv, getActiveEnv } from '../config/runtime.js';
import LoginPage from '../pages/LoginPage.js';

export const test = base.extend({
    /**
     * pageContextBrowser fixture:
     *  - tworzy context + page
     *  - loguje się i zwraca bookingLink
     *  - włącza tracing per test i zapisuje plik po teście
     */
    pageContextBrowser: async ({ browser }, use, testInfo) => {
        const env = getActiveEnv();

        console.log(`\n${'='.repeat(80)}`);
        console.log(`🚀 STARTING TEST: [${env.name.toUpperCase()}] (headed=${env.headed})`);
        console.log(`${'='.repeat(80)}\n`);

        // Tworzymy context na bazie aktywnego środowiska
        const context = await browser.newContext({ baseURL: env.baseUrl });
        const page = await context.newPage();

        // Start tracingu per test
        await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

        // Login + booking link
        const login = new LoginPage(page, env.baseUrl);
        await login.login(env.staffEmail, env.staffPassword);
        // Uwaga: metoda nazywa się go_to_homepage_after_login w naszej wersji JS
        const bookingLink = await login.go_to_homepage_after_login();

        try {
            await use({ page, context, bookingLink });
        } finally {
            const safeTitle = testInfo.title.replace(/[^a-z0-9-_]/gi, '_');
            const tracePath = `./trace-${safeTitle}-${env.name}-${Date.now()}.zip`;
            await context.tracing.stop({ path: tracePath });
            await context.close();
        }
    },
});

export { expect } from '@playwright/test';

/**
 * Opcjonalne utilsy jak w Twoim przykładzie
 */
export function setRuntimeEnv(envName) {
    setActiveEnv(envName);
    console.log(`🌍 Runtime environment set to: ${envName}`);
}

export function getCurrentEnv() {
    return getActiveEnv();
}
