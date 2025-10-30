/**
 * VoucherService - JavaScript version of pages/VoucherPage.py
 */

import { voucherLocators } from '../../locators/voucher/voucher.locators.js';

export class VoucherService {
  constructor(page) {
    this.page = page;
  }

  /**
   * Create voucher for user
   * @param {Voucher} voucher - Voucher to create
   */
  async createVoucherForUser(voucher) {
    console.log(`Creating voucher: ${voucher.serial} for user: ${voucher.user.email}`);
    
    await voucherLocators.managerLink(this.page).click();
    await voucherLocators.vouchersLink(this.page).click();
    await voucherLocators.addVoucherButton(this.page).click();

    await voucherLocators.serialInput(this.page).click();
    await voucherLocators.serialInput(this.page).fill(voucher.serial);

    await voucherLocators.searchClientButton(this.page).click();

    await voucherLocators.emailPlaceholder(this.page).click();
    await voucherLocators.emailPlaceholder(this.page).fill(voucher.user.email);

    await voucherLocators.userEmailButton(this.page, voucher.user.email).click();

    await voucherLocators.originalBalanceInput(this.page).click();
    await voucherLocators.originalBalanceInput(this.page).fill(voucher.originalBalance.toString());

    await voucherLocators.saveButton(this.page).click();
    await this.page.waitForTimeout(1000);


    console.log(`Voucher created: ${voucher.serial}`);
    const discardModal = voucherLocators.discardModal(this.page);
    if (await discardModal.isVisible()) {
        await voucherLocators.discardChangesButton(this.page).click();
    } else {
        await voucherLocators.saveChangesButton(this.page).waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Delete voucher
   * @param {string} serial - Voucher serial to delete
   */
  async deleteVoucher(serial) {
    console.log(`Deleting voucher: ${serial}`);
    
    // Find and click on the voucher
    await voucherLocators.voucherElement(this.page, serial).click();
    
    // Click delete button
    await voucherLocators.deleteButton(this.page).click();
    
    // Confirm deletion
    await voucherLocators.confirmButton(this.page).click();
    
    console.log(`Voucher deleted: ${serial}`);
  }
}

