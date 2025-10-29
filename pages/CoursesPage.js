/**
 * CoursesPage - JavaScript version of pages/CoursesPage.py
 */

import { navigateTo } from '../helpers/helpers.js';

export class CoursesPage {
  constructor(page) {
    this.page = page;
    this._managerTab = page.getByRole("link", { name: "Manager" });
    this._coursesTab = page.getByRole("link", { name: "courses-icon Courses" });
    this._addCourseButton = page.getByRole("button", { name: "Add Course" });
    this._courseNameInput = page.getByRole("textbox", { name: "Course name" });
    this._addServiceButton = page.getByLabel("Add Service");
    this._saveButton = page.getByRole("button", { name: "Save" });
  }

  /**
   * Create course
   * @param {Course} course - Course to create
   */
  async createCourse(course) {
      console.log(`Creating course: ${course.name}`);

      await navigateTo(this.page, "Manager");
      const discardModal = this.page.locator("h2", { hasText: "Discard all unsaved changes" });
      if (await discardModal.isVisible()) {
          await this.page.getByRole("button", { name: "Discard changes" }).click();
      } else {
          await this._saveButton.waitFor({ state: 'hidden', timeout: 3000 });
      }
      await navigateTo(this.page, "courses-icon Courses");

      await this._addCourseButton.click();

      await this._courseNameInput.fill(course.name);

      await this._addServiceButton.click();
      await this.page.getByRole("button", { name: course.categoryName }).click();
      await this.page.getByRole("button", { name: course.serviceName }).click();

      const priceInput = this.page.locator('input[aria-label="Total price"][name^="total-price-0-"]').first();
      const val = String(course.totalPrice);

      await priceInput.click();
      await priceInput.fill('');
      await priceInput.type(val, { delay: 60 });

      const inputValue = await priceInput.inputValue();
      if (!inputValue.includes(val.replace('.', ''))) {
          await priceInput.fill('');
          await priceInput.type(val.replace('.', ','), { delay: 60 });
      }

      await priceInput.press('Enter');

      const totalUnitsInput = this.page.getByRole("textbox", { name: "Total units" });
      await totalUnitsInput.fill(String(course.totalUnits));

      await this._saveButton.click();
      console.log(`✅ Course created: ${course.name}`);
      if (await discardModal.isVisible()) {
          await this.page.getByRole("button", { name: "Discard changes" }).click();
      } else {
          await this._saveButton.waitFor({ state: 'hidden', timeout: 3000 });
      }
  }


  /**
   * Delete course
   * @param {string} courseName - Course name to delete
   */
  async deleteCourse(courseName) {
    console.log(`Deleting course: ${courseName}`);
    
    // Find and click on the course
    const courseElement = this.page.locator(`text=${courseName}`);
    await courseElement.click();
    
    // Click delete button (implementation depends on UI)
    const deleteButton = this.page.getByRole("button", { name: "Delete" });
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.getByRole("button", { name: "Yes" });
    await confirmButton.click();
    
    console.log(`Course deleted: ${courseName}`);
  }
}
