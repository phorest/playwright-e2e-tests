/**
 * Appointments page locators
 */

export const appointmentsLocators = {
    appointmentsLink: (page) => page.getByRole("link", { name: "Appointments" }),
    managerLink: (page) => page.getByRole("link", { name: "Manager" }),
    salesTabLink: (page) => page.getByRole("link", { name: "sales-icon Sales" }),
    payButton: (page) => page.getByRole("button", { name: "Pay" }),
    notNowButton: (page) => page.getByRole("button", { name: "Not now" }),
    cashButton: (page) => page.getByRole("button", { name: "Cash", exact: true }),
    completePaymentButton: (page) => page.getByRole("button", { name: "Complete Payment" }),
    closeButton: (page) => page.getByRole("button", { name: "Close", exact: true }),
    removeButton: (page) => page.getByRole("button", { name: "Remove" }),
    deleteButton: (page) => page.getByRole("button", { name: "Delete" }),
    addAppointmentButton: (page) => page.getByRole("button", { name: "Add appointment" }),
    undoButton: (page) => page.getByRole("button", { name: "Undo" }),
    confirmUndoButton: (page) => page.getByRole("button", { name: "Yes" }),
    dontConvertButton: (page) => page.getByRole("button", { name: "Don't convert" }),
    nextDayButton: (page) => page.getByRole("button", { name: "Next day Day" }),
    bookingEntryByPhone: (page, phone) => page.locator(`xpath=//div[@role="button" and .//span[contains(normalize-space(), "${phone}")]]`),
    paymentRowByClient: (page, clientName) => page.locator(`xpath=//tr[.//td[@data-column-name='Client']//div[normalize-space()='${clientName}']]`).first()
};

