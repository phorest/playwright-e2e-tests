/**
 * CoursesService - JavaScript version of pages/CoursesPage.py
 */

import { navigateTo } from '../../helpers/helpers.js';
import { coursesLocators } from '../../locators/courses/courses.locators.js';

export class CoursesService {
  constructor(page) {
    this.page = page;
  }

  /**
   * Create course
   * @param {Course} course - Course to create
   */
  async createCourse(course) {
      console.log(`Creating course: ${course.name}`);

      await navigateTo(this.page, "Manager");
      const discardModal = coursesLocators.discardModal(this.page);
      if (await discardModal.isVisible()) {
          await coursesLocators.discardChangesButton(this.page).click();
      } else {
          await coursesLocators.saveButton(this.page).waitFor({ state: 'hidden', timeout: 3000 });
      }
      await navigateTo(this.page, "courses-icon Courses");

      await coursesLocators.addCourseButton(this.page).click();

      await coursesLocators.courseNameInput(this.page).fill(course.name);

      await coursesLocators.addServiceButton(this.page).click();
      await coursesLocators.categoryButton(this.page, course.categoryName).click();
      await coursesLocators.serviceButton(this.page, course.serviceName).click();

      const priceInput = coursesLocators.totalPriceInput(this.page);
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

      const totalUnitsInput = coursesLocators.totalUnitsInput(this.page);
      await totalUnitsInput.fill(String(course.totalUnits));

      await coursesLocators.saveButton(this.page).click();
      console.log(`✅ Course created: ${course.name}`);
      if (await discardModal.isVisible()) {
          await coursesLocators.discardChangesButton(this.page).click();
      } else {
          await coursesLocators.saveButton(this.page).waitFor({ state: 'hidden', timeout: 3000 });
      }
  }


  /**
   * Delete course
   * @param {string} courseName - Course name to delete
   */
  async deleteCourse(courseName) {
    console.log(`Deleting course: ${courseName}`);
    
    // Find and click on the course
    await coursesLocators.courseElement(this.page, courseName).click();
    
    // Click delete button (implementation depends on UI)
    await coursesLocators.deleteButton(this.page).click();
    
    // Confirm deletion
    await coursesLocators.confirmButton(this.page).click();
    
    console.log(`Course deleted: ${courseName}`);
  }
}

