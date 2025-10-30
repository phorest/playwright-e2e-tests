/**
 * Voucher page locators
 */

export const voucherLocators = {
    managerLink: (page) => page.getByRole("link", { name: "Manager" }),
    vouchersLink: (page) => page.getByRole("link", { name: "vouchers-icon Vouchers" }),
    addVoucherButton: (page) => page.getByRole("button", { name: "Add Voucher" }),
    serialInput: (page) => page.getByRole("textbox", { name: "Serial" }),
    searchClientButton: (page) => page.getByRole("button", { name: "Search for a client" }),
    originalBalanceInput: (page) => page.getByRole("textbox", { name: "Original Balance Open" }),
    saveButton: (page) => page.getByRole("button", { name: "Save" }),
    saveChangesButton: (page) => page.getByRole("button", { name: "Save changes" }),
    emailPlaceholder: (page) => page.getByPlaceholder("Email"),
    userEmailButton: (page, email) => page.getByRole("button", { name: email }),
    discardModal: (page) => page.locator("h2", { hasText: "Discard all unsaved changes" }),
    discardChangesButton: (page) => page.getByRole("button", { name: "Discard changes" }),
    voucherElement: (page, serial) => page.locator(`text=${serial}`),
    deleteButton: (page) => page.getByRole("button", { name: "Delete" }),
    confirmButton: (page) => page.getByRole("button", { name: "Yes" })
};

