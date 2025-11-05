/**
 * ClientsPage - JavaScript version of pages/ClientsPage.py
 */

import { expect } from '@playwright/test';
import { navigateTo } from '../helpers/helpers.js';
import { getTimeout } from '../config/timeouts.js';

export class ClientsPage {
    constructor(page) {
        this.page = page;

        this._clientsLink = page.getByRole("link", { name: "Clients" });
        this._appointmentHistoryTab = page.getByRole("button", { name: "Appointment history", exact: true });
        this._spendTab = page.getByRole("button", { name: "Spend", exact: true });

        this.closeFiltersButton = page.getByRole("button", { name: "Close", exact: true });
        this.firstNameSearchbox = page.getByRole("searchbox", { name: "First name, ID or Treatcard" });
        this.lastNameSearchbox = page.getByRole("searchbox", { name: "Last name" });
        this.phoneSearchbox = page.getByRole("searchbox", { name: "Phone number" });
        this.emailSearchbox = page.getByRole("searchbox", { name: "Email address" });

        this.firstNameInput = page.getByLabel("First name").first();
        this.lastNameInput = page.getByLabel("Last name").first();
        this.phoneInput = page.getByLabel("Phone Number").first();
        this.emailInput = page.getByLabel("Email").first();
        this._spendTotalValue = page.locator(
            "xpath=//p[normalize-space()='Spend total']/following-sibling::p[1]"
        );
        this._serviceSpendValue = page.locator(
            "xpath=//p[normalize-space()='Service spend total']/preceding-sibling::p[1]"
        );
    }

    /**
     * Format phone number for UI
     * @param {string} raw - Raw phone number
     * @returns {string} Formatted phone number
     */
    _uiPhone(raw) {
        return raw.startsWith("0049") ? raw : `0049${raw}`;
    }

    /**
     * Go to clients page
     */
    _goToClients() {
        this._clientsLink.click();
    }

    /**
     * Go to appointment history tab
     */
    _goAppointmentHistoryTab() {
        this._appointmentHistoryTab.click();
    }

    /**
     * Go to spend tab
     */
    _goSpendTab() {
        this._spendTab.click();
    }

    /**
     * Search for clients
     * @param {User} user - User to search for
     */
    async searchForClients(user) {
        await navigateTo(this.page, "Clients");

        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);

        await this.firstNameSearchbox.fill(first);
        await this.lastNameSearchbox.fill(last);
        await this.phoneSearchbox.fill(phoneUi);
        await this.emailSearchbox.fill(user.email);
        await this.page.keyboard.press("Enter");
        await this.openClientRow(user);
    }

    /**
     * Open client row
     * @param {User} user - User to open
     */
    async openClientRow(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);
        const xpath = (
            `//tr[.//text()[normalize-space()='${first}'] ` +
            `and .//text()[normalize-space()='${last}'] ` +
            `and .//text()[normalize-space()='${phoneUi}']]`
        );
        await this.page.locator(`xpath=${xpath}`).click();
    }

    /**
     * Verify client details
     * @param {User} user - User to verify
     */
    async verifyClientDetails(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);

        const checks = [
            ["First name", this.firstNameInput, first],
            ["Last name", this.lastNameInput, last],
            ["Phone", this.phoneInput, phoneUi],
            ["Email", this.emailInput, user.email],
        ];

        console.log("\n  Verifying client detail form …");
        for (const [label, locator, expected] of checks) {
            const actual = (await locator.inputValue()).trim();
            const ok = actual.toLowerCase() === expected.toLowerCase();
            console.log(`   ${ok ? '✔' : '✘'} ${label.padEnd(10)} | UI '${actual}' | expected '${expected}'`);
            if (!ok) {
                throw new Error(`${label}: '${actual}' ≠ '${expected}'`);
            }
        }

        console.log("  Client details verified.\n");
    }

    /**
     * Verify history row
     * @param {Appointment} appt - Appointment to verify
     * @param {boolean} shouldExist - Whether appointment should exist (default: true)
     */
    async verifyHistoryRow(appt, shouldExist = true) {
        await this._goAppointmentHistoryTab();

        const fragments = new Set([
            appt.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase(),
            appt.time.trim().toLowerCase(),
            appt.staff.toLowerCase(),
            appt.service.toLowerCase(),
            `€${appt.price.toFixed(2)}`.toLowerCase(),
        ]);
        console.log(`\n Looking for history row matching: ${JSON.stringify([...fragments])}\n`);

        if (!shouldExist) {
            const placeholder = this.page.getByText("No past appointments", { exact: true });
            await expect(placeholder).toBeVisible();
            console.log(" 'No past appointments' is visible, no rows present.\n");
            return;
        }

        const rows = this.page.locator("tr");
        await rows.first().waitFor({ state: "visible" });

        let matchCount = 0;
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const txt = (await rows.nth(i).innerText()).toLowerCase().replace(/\u00a0/g, " ");
            const allMatch = [...fragments].every(frag => txt.includes(frag));
            if (allMatch) {
                matchCount++;
                console.log(`  ✔ row #${i} matches`);
            } else {
                console.log(`  ✖ row #${i} does not match`);
            }
        }

        if (matchCount !== 1) {
            throw new Error(`❌ Expected exactly one matching row, found ${matchCount}`);
        }
        const row = rows.filter({ hasText: appt.staff }).first();
        await expect(row).toBeVisible();
        console.log(" History row verified.\n");
    }

    /**
     * Verify spend total
     * @param {Appointment} appt - Appointment to verify
     */
    async verifySpendTotal(appt) {
        await this._goSpendTab();
        const expected = `€${appt.price.toFixed(2)}`;

        const actualSpend = (await this._spendTotalValue.innerText()).trim();
        console.log(` Spend total – expected '${expected}', actual '${actualSpend}'`);
        await expect(this._spendTotalValue).toBeVisible();
        await expect(this._spendTotalValue).toHaveText(expected);

        const actualService = (await this._serviceSpendValue.innerText()).trim();
        console.log(` Service spend total – expected '${expected}', actual '${actualService}'`);
        await expect(this._serviceSpendValue).toBeVisible();
        await expect(this._serviceSpendValue).toHaveText(expected);
    }

    /**
     * Forget client
     * @param {User} user - User to forget
     */
    async forgetClient(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");

        console.log(` Forgetting client ... ${first} ${last} with email ${user.email} in progress`);
        await this.page.getByRole("button", { name: "Client actions" }).click();
        await this.page.getByRole("menuitem", { name: "Forget" }).click();
        await this.page.getByRole("button", { name: "Forget" }).click();
        await expect(this.page.getByRole("button", { name: "Forget" })).not.toBeVisible();
        console.log(` Client ${first} ${last} with email ${user.email} has been forgotten.`);

        this._goToClients();
        const phoneUi = user.phone;

        console.log(` Re-applying filters for verification: ${first}, ${last}, ${phoneUi}, ${user.email}`);
        await this.firstNameSearchbox.fill(first);
        await this.lastNameSearchbox.fill(last);
        await this.phoneSearchbox.fill(phoneUi);
        await this.emailSearchbox.fill(user.email);
        await this.page.keyboard.press("Enter");

        const placeholder = this.page.getByText("No Results Found", { exact: true });
        await expect(placeholder).toBeVisible();
        console.log(` 'No Results Found' is visible, client ${first} ${last} with email ${user.email} was successfully forgotten.\n`);
    }

    /**
     * Verify no results
     */
    async _verifyNoResults() {
        const placeholder = this.page.getByText("No Results Found", { exact: true });
        await expect(placeholder).toBeVisible();
        console.log(" 'No Results Found' is visible for client.");
    }
}
