/**
 * Courses page locators
 */

export const coursesLocators = {
    managerTab: (page) => page.getByRole("link", { name: "Manager" }),
    coursesTab: (page) => page.getByRole("link", { name: "courses-icon Courses" }),
    addCourseButton: (page) => page.getByRole("button", { name: "Add Course" }),
    courseNameInput: (page) => page.getByRole("textbox", { name: "Course name" }),
    addServiceButton: (page) => page.getByLabel("Add Service"),
    saveButton: (page) => page.getByRole("button", { name: "Save" }),
    discardModal: (page) => page.locator("h2", { hasText: "Discard all unsaved changes" }),
    discardChangesButton: (page) => page.getByRole("button", { name: "Discard changes" }),
    categoryButton: (page, categoryName) => page.getByRole("button", { name: categoryName }),
    serviceButton: (page, serviceName) => page.getByRole("button", { name: serviceName }),
    totalPriceInput: (page) => page.locator('input[aria-label="Total price"][name^="total-price-0-"]').first(),
    totalUnitsInput: (page) => page.getByRole("textbox", { name: "Total units" }),
    courseElement: (page, courseName) => page.locator(`text=${courseName}`),
    deleteButton: (page) => page.getByRole("button", { name: "Delete" }),
    confirmButton: (page) => page.getByRole("button", { name: "Yes" })
};

