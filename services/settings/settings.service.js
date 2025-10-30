/**
 * SettingsService
 */

import { expect } from '@playwright/test';
import { navigateTo } from '../../helpers/helpers.js';
import { settingsLocators } from '../../locators/settings/settings.locators.js';

export class SettingsService {
  constructor(page) {
    this.page = page;
    this._iframe = settingsLocators.iframe(page);
  }

  /**
   * Go to manager
   */
  async _goToManager() {
    await navigateTo(this.page, "Manager");
  }

  /**
   * Go to settings
   */
  async _goToSettings() {
    await navigateTo(this.page, "settings-icon Settings");
  }

  /**
   * Open settings page
   */
  async open() {
    await this._goToManager();
    await this._goToSettings();
  }

  /**
   * Copy online booking link
   * @returns {string} Booking link
   */
  async copyOnlineBookingLink() {
    await this.open();
    await settingsLocators.onlineLink(this._iframe).click();

    const copyLinkBtn = settingsLocators.copyLinkButton(this._iframe);
    const linkHref = await copyLinkBtn.getAttribute("data-copyable-text");
    console.log(` Booking link extracted: ${linkHref}`);

    if (!linkHref || !linkHref.startsWith("https://")) {
      throw new Error(`❌ Invalid booking link fetched: ${linkHref}`);
    }

    return linkHref;
  }

  /**
   * Open opening hours
   */
  async openOpeningHours() {
    await this.open();
    await settingsLocators.openingLink(this._iframe).click();
  }

  /**
   * Open contact info
   */
  async openContactInfo() {
    await this.open();
    await settingsLocators.contactInfo(this._iframe).click();
  }

  /**
   * Verify weekly hours
   * @param {ContactInfo} contact - Contact info
   */
  async verifyWeeklyHours(contact) {
    const openingLink = settingsLocators.openingLink(this._iframe);
    const openingClass = await openingLink.getAttribute("class", { timeout: 0 });
    if (!openingClass || !openingClass.includes("is-active")) {
      await this.openOpeningHours();
    }

    for (const [day, [expOpen, expClose]] of Object.entries(contact.openingHours)) {
      const row = settingsLocators.openingRow(this._iframe, day);
      const openCell = row.locator("td").nth(1);
      const closeCell = row.locator("td").nth(2);
      const statusCell = row.locator("td").nth(3);

      const actOpen = (await openCell.innerText()).trim();
      const actClose = (await closeCell.innerText()).trim();
      const actStatus = (await statusCell.innerText()).trim();

      console.log(` ${day.padEnd(9)} | UI ${actOpen} – ${actClose} (${actStatus}) | expected ${expOpen} – ${expClose} (Yes)`);

      await expect(openCell).toHaveText(expOpen, { ignoreCase: true });
      await expect(closeCell).toHaveText(expClose, { ignoreCase: true });
      await expect(statusCell).toHaveText("Yes");
    }

    console.log(" Weekly Hours verified successfully.\n");
  }

  /**
   * Verify branch contact details
   * @param {ContactInfo} contact - Contact info
   */
  async verifyBranchContactDetails(contact) {
    const fields = [
      ["address-line-1", contact.addressLine1],
      ["address-line-2", contact.addressLine2],
      ["city", contact.city],
      ["state-county", contact.state],
      ["postcode", contact.postcode],
      ["country", contact.country],
      ["sms", contact.phone],
    ];

    console.log("\n  Verifying branch contact fields …");
    for (const [nameAttr, expected] of fields) {
      const inputField = settingsLocators.inputField(this._iframe, nameAttr);
      const value = (await inputField.inputValue()).trim();
      const ok = value.toLowerCase() === expected.toLowerCase();
      const status = ok ? "✔" : "✘";
      console.log(`   ${status} ${nameAttr.padEnd(12)} | UI '${value}' | expected '${expected}'`);

      if (!ok) {
        throw new Error(`${nameAttr}: '${value}' != '${expected}'`);
      }
    }
  }
}

