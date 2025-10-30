/**
 * PaymentService - JavaScript version of pages/PaymentPage.py
 */

import { expect } from '@playwright/test';
import { paymentLocators } from '../../locators/payment/payment.locators.js';

export class PaymentService {
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

    await paymentLocators.clientButton(this.page, fullName, phone).click();
    await paymentLocators.payButton(this.page).click();
    await paymentLocators.notNowButton(this.page).click();
    await paymentLocators.cashButton(this.page).click();
    await paymentLocators.completePaymentButton(this.page).click();

    console.log(` Payment completed for: ${fullName}`);
  }

  /**
   * Undo payment
   * @param {string} fullName - Full name
   */
  async undoPayment(fullName) {
    console.log(` Undoing payment for: ${fullName}`);

    await paymentLocators.managerLink(this.page).click();
    await paymentLocators.salesLink(this.page).click();
    await paymentLocators.clientText(this.page, fullName).click();

    await expect(paymentLocators.ownerText(this.page)).toBeVisible();

    await paymentLocators.clientCell(this.page, fullName).click();
    await paymentLocators.clientCell(this.page, fullName).click();
    await paymentLocators.undoButton(this.page).click();
    await paymentLocators.confirmButton(this.page).click();

    console.log(` Payment undone for: ${fullName}`);
  }
}

