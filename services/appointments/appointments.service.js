/**
 * AppointmentsService
 */

import { expect } from '@playwright/test';
import { navigateTo } from '../../helpers/helpers.js';
import { getActiveEnv } from '../../config/runtime.js';
import { getTimeout } from '../../config/timeouts.js';
import { appointmentsLocators } from '../../locators/appointments/appointments.locators.js';

export class AppointmentsService {
    constructor(page) {
        this.page = page;
    }

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

    async goto() {
        await navigateTo(this.page, "Appointments");
    }

    async clickBookingByPhone(phone, maxDaysAhead = 5) {
        console.log(`🖱️ Searching booking for phone: ${phone}`);
        
        for (let day = 0; day < maxDaysAhead; day++) {
            console.log(` Attempt ${day + 1}: looking for booking entry...`);
            try {
                await this.page.waitForTimeout(500);
                const bookingEntry = appointmentsLocators.bookingEntryByPhone(this.page, phone);
                await bookingEntry.waitFor({ timeout: 3000, state: 'visible' });
                console.log(` Booking found for phone: ${phone} (day offset: ${day})`);
                await bookingEntry.click();
                return;
            } catch (error) {
                console.log(`⏳ Not found or not yet visible on day offset ${day}.`);
            }

            console.log(`➡️ Moving to next day (attempt ${day + 2})`);
            await appointmentsLocators.nextDayButton(this.page).click();
        }

        throw new Error(`❌ Booking for phone ${phone} not found within ${maxDaysAhead} days.`);
    }

    async makeCashPaymentByPhone(phone) {
        console.log(` Making cash payment for phone: ${phone}`);
        await this.goto();
        await this.clickBookingByPhone(phone);

        await appointmentsLocators.payButton(this.page).click();
        await appointmentsLocators.notNowButton(this.page).click();

        try {
            await appointmentsLocators.dontConvertButton(this.page).waitFor({ timeout: 3000 });
            console.log(" 'Don't convert' button appeared — clicking it.");
            await appointmentsLocators.dontConvertButton(this.page).click();
        } catch (error) {
            console.log(" 'Don't convert' button did not appear — skipping.");
        }

        const cashBtn = appointmentsLocators.cashButton(this.page);
        if (await cashBtn.isVisible()) {
            console.log(" Cash button is visible — clicking it.");
            await cashBtn.click();
        } else {
            console.log(" Cash button not visible — skipping.");
        }

        await appointmentsLocators.completePaymentButton(this.page).click();
        await appointmentsLocators.closeButton(this.page).click();

        console.log(` Cash payment for phone ${phone} completed.`);
    }

    async verifyAndUndoPaymentByClientName(clientName, timeout = 5000) {
        console.log(` Verifying and undoing payment for client: ${clientName}`);

        await appointmentsLocators.managerLink(this.page).click();
        await appointmentsLocators.salesTabLink(this.page).click();

        await appointmentsLocators.paymentRowByClient(this.page, clientName).click();

        await appointmentsLocators.undoButton(this.page).click();
        await appointmentsLocators.confirmUndoButton(this.page).click();

        console.log(` Payment undone for client: ${clientName}`);
    }

    async deleteBookingByPhone(phone) {
        console.log(` Deleting booking for phone: ${phone}`);
        await this.goto();
        await this.page.reload();

        await this.clickBookingByPhone(phone);

        await appointmentsLocators.removeButton(this.page).click();
        await appointmentsLocators.deleteButton(this.page).click();

        console.log(` Booking deleted for phone: ${phone}`);
    }
}
