/**
 * Clients page locators
 */

export const clientsLocators = {
    clientsLink: (page) => page.getByRole("link", { name: "Clients" }),
    appointmentHistoryTab: (page) => page.getByRole("button", { name: "Appointment history", exact: true }),
    spendTab: (page) => page.getByRole("button", { name: "Spend", exact: true }),
    closeFiltersButton: (page) => page.getByRole("button", { name: "Close", exact: true }),
    firstNameSearchbox: (page) => page.getByRole("searchbox", { name: "First name, ID or Treatcard" }),
    lastNameSearchbox: (page) => page.getByRole("searchbox", { name: "Last name" }),
    phoneSearchbox: (page) => page.getByRole("searchbox", { name: "Phone number" }),
    emailSearchbox: (page) => page.getByRole("searchbox", { name: "Email address" }),
    firstNameInput: (page) => page.getByLabel("First name").first(),
    lastNameInput: (page) => page.getByLabel("Last name").first(),
    phoneInput: (page) => page.getByLabel("Phone Number").first(),
    emailInput: (page) => page.getByLabel("Email").first(),
    spendTotalValue: (page) => page.locator("xpath=//p[normalize-space()='Spend total']/following-sibling::p[1]"),
    serviceSpendValue: (page) => page.locator("xpath=//p[normalize-space()='Service spend total']/preceding-sibling::p[1]"),
    clientRow: (page, first, last, phoneUi) => page.locator(`xpath=//tr[.//text()[normalize-space()='${first}'] and .//text()[normalize-space()='${last}'] and .//text()[normalize-space()='${phoneUi}']]`),
    clientActionsButton: (page) => page.getByRole("button", { name: "Client actions" }),
    forgetMenuItem: (page) => page.getByRole("menuitem", { name: "Forget" }),
    forgetButton: (page) => page.getByRole("button", { name: "Forget" }),
    noResultsText: (page) => page.getByText("No Results Found", { exact: true }),
    noPastAppointmentsText: (page) => page.getByText("No past appointments", { exact: true }),
    tableRows: (page) => page.locator("tr")
};
