/**
 * VoucherPage - JavaScript version of pages/VoucherPage.py
 */

export class VoucherPage {
  constructor(page) {
    this.page = page;
    this.managerLink = page.getByRole("link", { name: "Manager" });
    this.vouchersLink = page.getByRole("link", { name: "vouchers-icon Vouchers" });
    this.addVoucherButton = page.getByRole("button", { name: "Add Voucher" });
    this.serialInput = page.getByRole("textbox", { name: "Serial" });
    this.searchClientButton = page.getByRole("button", { name: "Search for a client" });
    this.originalBalanceInput = page.getByRole("textbox", { name: "Original Balance Open" });
    this.saveButton = page.getByRole("button", { name: "Save" });
    this._saveButton = page.getByRole("button", { name: "Save changes" });

  }

  /**
   * Create voucher for user
   * @param {Voucher} voucher - Voucher to create
   */
  async createVoucherForUser(voucher) {
    console.log(`Creating voucher: ${voucher.serial} for user: ${voucher.user.email}`);
    
    await this.managerLink.click();
    await this.vouchersLink.click();
    await this.addVoucherButton.click();

    await this.serialInput.click();
    await this.serialInput.fill(voucher.serial);

    await this.searchClientButton.click();

    await this.page.getByPlaceholder("Email").click();
    await this.page.getByPlaceholder("Email").fill(voucher.user.email);

    await this.page.getByRole("button", { name: voucher.user.email }).click();

    await this.originalBalanceInput.click();
    await this.originalBalanceInput.fill(voucher.originalBalance.toString());

    await this.saveButton.click();
    await this.page.waitForTimeout(1000);


    console.log(`Voucher created: ${voucher.serial}`);
    const discardModal = this.page.locator("h2", { hasText: "Discard all unsaved changes" });
    if (await discardModal.isVisible()) {
        await this.page.getByRole("button", { name: "Discard changes" }).click();
    } else {
        await this._saveButton.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Delete voucher
   * @param {string} serial - Voucher serial to delete
   */
  async deleteVoucher(serial) {
    console.log(`Deleting voucher: ${serial}`);
    
    // Find and click on the voucher
    const voucherElement = this.page.locator(`text=${serial}`);
    await voucherElement.click();
    
    // Click delete button
    const deleteButton = this.page.getByRole("button", { name: "Delete" });
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.getByRole("button", { name: "Yes" });
    await confirmButton.click();
    
    console.log(`Voucher deleted: ${serial}`);
  }
}
