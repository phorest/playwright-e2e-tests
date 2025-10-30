/**
 * ClientsService - JavaScript version of pages/ClientsPage.py
 */

import { expect } from '@playwright/test';
import { navigateTo } from '../../helpers/helpers.js';
import { getTimeout } from '../../config/timeouts.js';
import { clientsLocators } from '../../locators/clients/clients.locators.js';

export class ClientsService {
    constructor(page) {
        this.page = page;
    }

    _uiPhone(raw) {
        return raw.startsWith("0049") ? raw : `0049${raw}`;
    }

    _goToClients() {
        clientsLocators.clientsLink(this.page).click();
    }

    _goAppointmentHistoryTab() {
        clientsLocators.appointmentHistoryTab(this.page).click();
    }

    _goSpendTab() {
        clientsLocators.spendTab(this.page).click();
    }

    async searchForClients(user) {
        await navigateTo(this.page, "Clients");

        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);

        await clientsLocators.firstNameSearchbox(this.page).fill(first);
        await clientsLocators.lastNameSearchbox(this.page).fill(last);
        await clientsLocators.phoneSearchbox(this.page).fill(phoneUi);
        await clientsLocators.emailSearchbox(this.page).fill(user.email);
        await this.page.keyboard.press("Enter");
        await this.openClientRow(user);
    }

    async openClientRow(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);
        await clientsLocators.clientRow(this.page, first, last, phoneUi).click();
    }

    async verifyClientDetails(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        const phoneUi = this._uiPhone(user.phone);

        const checks = [
            ["First name", clientsLocators.firstNameInput(this.page), first],
            ["Last name", clientsLocators.lastNameInput(this.page), last],
            ["Phone", clientsLocators.phoneInput(this.page), phoneUi],
            ["Email", clientsLocators.emailInput(this.page), user.email],
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
            const placeholder = clientsLocators.noPastAppointmentsText(this.page);
            await expect(placeholder).toBeVisible();
            console.log(" 'No past appointments' is visible, no rows present.\n");
            return;
        }

        const rows = clientsLocators.tableRows(this.page);
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

    async verifySpendTotal(appt) {
        await this._goSpendTab();
        const expected = `€${appt.price.toFixed(2)}`;

        const spendTotal = clientsLocators.spendTotalValue(this.page);
        const actualSpend = (await spendTotal.innerText()).trim();
        console.log(` Spend total – expected '${expected}', actual '${actualSpend}'`);
        await expect(spendTotal).toBeVisible();
        await expect(spendTotal).toHaveText(expected);

        const serviceSpend = clientsLocators.serviceSpendValue(this.page);
        const actualService = (await serviceSpend.innerText()).trim();
        console.log(` Service spend total – expected '${expected}', actual '${actualService}'`);
        await expect(serviceSpend).toBeVisible();
        await expect(serviceSpend).toHaveText(expected);
    }

    async forgetClient(user) {
        const parts = user.name.split(" ");
        const first = parts[0];
        const last = parts.slice(1).join(" ");

        console.log(` Forgetting client ... ${first} ${last} with email ${user.email} in progress`);
        await clientsLocators.clientActionsButton(this.page).click();
        await clientsLocators.forgetMenuItem(this.page).click();
        await clientsLocators.forgetButton(this.page).click();
        await expect(clientsLocators.forgetButton(this.page)).not.toBeVisible();
        console.log(` Client ${first} ${last} with email ${user.email} has been forgotten.`);

        this._goToClients();
        const phoneUi = user.phone;

        console.log(` Re-applying filters for verification: ${first}, ${last}, ${phoneUi}, ${user.email}`);
        await clientsLocators.firstNameSearchbox(this.page).fill(first);
        await clientsLocators.lastNameSearchbox(this.page).fill(last);
        await clientsLocators.phoneSearchbox(this.page).fill(phoneUi);
        await clientsLocators.emailSearchbox(this.page).fill(user.email);
        await this.page.keyboard.press("Enter");

        const placeholder = clientsLocators.noResultsText(this.page);
        await expect(placeholder).toBeVisible();
        console.log(` 'No Results Found' is visible, client ${first} ${last} with email ${user.email} was successfully forgotten.\n`);
    }

    async _verifyNoResults() {
        const placeholder = clientsLocators.noResultsText(this.page);
        await expect(placeholder).toBeVisible();
        console.log(" 'No Results Found' is visible for client.");
    }
}
