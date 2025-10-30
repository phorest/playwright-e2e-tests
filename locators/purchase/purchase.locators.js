/**
 * Purchase page locators
 */

export const purchaseLocators = {
    purchaseTab: (page) => page.getByRole("link", { name: "Purchase" }),
    emailInput: (page) => page.getByPlaceholder("Email"),
    hotKeysButton: (page) => page.getByRole("button", { name: "Hot Keys" }),
    membershipsButton: (page) => page.locator("//button[.//p[normalize-space()='Memberships']]"),
    saveButton: (page) => page.getByRole("button", { name: "Save" }),
    noButton: (page) => page.getByRole("button", { name: "No", exact: true }),
    payButton: (page) => page.getByRole("button", { name: "Pay" }),
    cashButton: (page) => page.getByRole("button", { name: "Cash", exact: true }),
    completePaymentButton: (page) => page.getByRole("button", { name: "Complete Payment" }),
    closeButton: (page) => page.getByRole("button", { name: "Close", exact: true }),
    coursesButton: (page) => page.getByRole("button", { name: "Courses" }),
    userButton: (page, userName) => page.getByRole("button", { name: userName }),
    staffButton: (page, staffName) => page.getByRole("button", { name: staffName }),
    membershipRadio: (page, membershipName) => page.getByRole("radio", { name: membershipName }),
    categoryButton: (page, categoryName) => page.getByRole("button", { name: categoryName }),
    courseButton: (page, courseName) => page.getByRole("button", { name: `${courseName} €` })
};

