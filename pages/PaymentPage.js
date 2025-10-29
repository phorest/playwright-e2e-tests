/**
 * PaymentPage - JavaScript version of pages/PaymentPage.py
 */

import { expect } from '@playwright/test';

export class PaymentPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Make cash payment
   * @param {string} fullName - Full name
   * @param {string} phone - Phone number
   */
  async makeCashPayment(fullName, phone) {
    console.log(` Making payment for: ${fullName}, phone: ${phone}`);

    await this.page.getByRole("button", { name: `${fullName} ${phone}` }).click();
    await this.page.getByRole("button", { name: "Pay" }).click();
    await this.page.getByRole("button", { name: "Not now" }).click();
    await this.page.getByRole("button", { name: "Cash", exact: true }).click();
    await this.page.getByRole("button", { name: "Complete Payment" }).click();

    console.log(` Payment completed for: ${fullName}`);
  }

  /**
   * Undo payment
   * @param {string} fullName - Full name
   */
  async undoPayment(fullName) {
    console.log(` Undoing payment for: ${fullName}`);

    await this.page.getByRole("link", { name: "Manager" }).click();
    await this.page.getByRole("link", { name: "sales-icon Sales" }).click();
    await this.page.getByText(fullName).click();

    await expect(this.page.getByText("Mateusz Owner")).toBeVisible();

    await this.page.getByRole("cell", { name: fullName }).click();
    await this.page.getByRole("cell", { name: fullName }).click();
    await this.page.getByRole("button", { name: "Undo" }).click();
    await this.page.getByRole("button", { name: "Yes" }).click();

    console.log(` Payment undone for: ${fullName}`);
  }
}
