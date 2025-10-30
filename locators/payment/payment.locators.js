/**
 * Payment page locators
 */

export const paymentLocators = {
    clientButton: (page, fullName, phone) => page.getByRole("button", { name: `${fullName} ${phone}` }),
    payButton: (page) => page.getByRole("button", { name: "Pay" }),
    notNowButton: (page) => page.getByRole("button", { name: "Not now" }),
    cashButton: (page) => page.getByRole("button", { name: "Cash", exact: true }),
    completePaymentButton: (page) => page.getByRole("button", { name: "Complete Payment" }),
    managerLink: (page) => page.getByRole("link", { name: "Manager" }),
    salesLink: (page) => page.getByRole("link", { name: "sales-icon Sales" }),
    clientText: (page, fullName) => page.getByText(fullName),
    ownerText: (page) => page.getByText("Mateusz Owner"),
    clientCell: (page, fullName) => page.getByRole("cell", { name: fullName }),
    undoButton: (page) => page.getByRole("button", { name: "Undo" }),
    confirmButton: (page) => page.getByRole("button", { name: "Yes" })
};

