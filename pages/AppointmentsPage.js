/**
 * AppointmentsPage - JavaScript version of pages/AppointmentsPage.py
 */

import { expect } from '@playwright/test';
import { navigateTo } from '../helpers/helpers.js';
import { getActiveEnv } from '../config/runtime.js';
import { getTimeout } from '../config/timeouts.js';

export class AppointmentsPage {
    constructor(page) {
        this.page = page;
        this.appointmentsLink = this.page.getByRole("link", { name: "Appointments" });
        this.managerLink = this.page.getByRole("link", { name: "Manager" });
        this.salesTabLink = this.page.getByRole("link", { name: "sales-icon Sales" });

        this.payButton = this.page.getByRole("button", { name: "Pay" });
        this.notNowButton = this.page.getByRole("button", { name: "Not now" });
        this.cashButton = this.page.getByRole("button", { name: "Cash", exact: true });
        this.completePaymentButton = this.page.getByRole("button", { name: "Complete Payment" });
        this.closeButton = this.page.getByRole("button", { name: "Close", exact: true });

        this.removeButton = this.page.getByRole("button", { name: "Remove" });
        this.deleteButton = this.page.getByRole("button", { name: "Delete" });
        this.clickAddAppointment = this.page.getByRole("button", { name: "Add appointment" });

        this.undoButton = this.page.getByRole("button", { name: "Undo" });
        this.confirmUndoButton = this.page.getByRole("button", { name: "Yes" });
        this.dontConvertButton = this.page.getByRole("button", { name: "Don't convert" });
    }

    /**
     * Get tenant base URL
     * @returns {string} Tenant base URL
     */
    async _tenantBase() {
        if (!this.page.url.match(/\/a\/\d+\//)) {
            await this.page.goto("/");
            await this.page.waitForURL(/\/a\/\d+\//, { timeout: 15000 });
        }

        const match = this.page.url.match(/^(https?:\/\/[^\/]+)\/a\/(\d+)\//);
        if (match) {
            const [, host, acc] = match;
            return `${host}/a/${acc}`;
        }

        const match2 = this.page.url.match(/\/a\/(\d+)\//);
        if (match2) {
            const acc = match2[1];
            const host = getActiveEnv().baseUrl.replace(/\/$/, '');
            return `${host}/a/${acc}`;
        }

        throw new Error(`Cannot extract accountId from URL: ${this.page.url}`);
    }

    /**
     * Go to appointments page
     */
    async goto() {
        await navigateTo(this.page, "Appointments");
    }

    /**
     * Click booking by phone
     * @param {string} phone - Phone number
     * @param {number} maxDaysAhead - Maximum days to look ahead
     */
    async clickBookingByPhone(phone, maxDaysAhead = 5) {
        console.log(`🖱️ Searching booking for phone: ${phone}`);
        const xpath = `//div[@role="button" and .//span[contains(normalize-space(), "${phone}")]]`;

        for (let day = 0; day < maxDaysAhead; day++) {
            console.log(` Attempt ${day + 1}: looking for booking entry...`);
            try {
                await this.page.waitForTimeout(500);
                const bookingEntry = await this.page.waitForSelector(
                    `xpath=${xpath}`, { timeout: 3000, state: 'visible' }
                );
                console.log(` Booking found for phone: ${phone} (day offset: ${day})`);
                await bookingEntry.click();
                return;
            } catch (error) {
                console.log(`⏳ Not found or not yet visible on day offset ${day}.`);
            }

            console.log(`➡️ Moving to next day (attempt ${day + 2})`);
            await this.page.getByRole("button", { name: "Next day Day" }).click();
        }

        throw new Error(`❌ Booking for phone ${phone} not found within ${maxDaysAhead} days.`);
    }

    /**
     * Make cash payment by phone
     * @param {string} phone - Phone number
     */
    async makeCashPaymentByPhone(phone) {
        console.log(` Making cash payment for phone: ${phone}`);
        await this.goto();
        await this.clickBookingByPhone(phone);

        await this.payButton.click();
        await this.notNowButton.click();

        try {
            await this.dontConvertButton.waitFor({ timeout: 3000 });
            console.log(" 'Don't convert' button appeared — clicking it.");
            await this.dontConvertButton.click();
        } catch (error) {
            console.log(" 'Don't convert' button did not appear — skipping.");
        }

        if (await this.cashButton.isVisible()) {
            console.log(" Cash button is visible — clicking it.");
            await this.cashButton.click();
        } else {
            console.log(" Cash button not visible — skipping.");
        }

        await this.completePaymentButton.click();
        await this.closeButton.click();

        console.log(` Cash payment for phone ${phone} completed.`);
    }

    /**
     * Verify and undo payment by client name
     * @param {string} clientName - Client name
     * @param {number} timeout - Timeout in milliseconds
     */
    async verifyAndUndoPaymentByClientName(clientName, timeout = 5000) {
        console.log(` Verifying and undoing payment for client: ${clientName}`);

        await this.managerLink.click();
        await this.salesTabLink.click();

        // Find and click the payment
        await this.page
            .locator(`xpath=//tr[.//td[@data-column-name='Client']//div[normalize-space()='${clientName}']]`)
            .first()
            .click();

        // Undo payment
        await this.page.getByRole("button", { name: "Undo" }).click();
        await this.page.getByRole("button", { name: "Yes" }).click();

        console.log(` Payment undone for client: ${clientName}`);
    }

    /**
     * Delete booking by phone
     * @param {string} phone - Phone number
     */
    async deleteBookingByPhone(phone) {
        console.log(` Deleting booking for phone: ${phone}`);
        await this.goto();
        await this.page.reload();

        await this.clickBookingByPhone(phone);

        // Click delete button
        await this.page.getByRole("button", { name: "Remove" }).click();
        await this.page.getByRole("button", { name: "Delete" }).click();

        console.log(` Booking deleted for phone: ${phone}`);
    }
}
