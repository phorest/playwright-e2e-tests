/**
 * CourseBuilder - JavaScript version of builders/CourseBuilder.py
 */

import { Course } from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

export class CourseBuilder {
  constructor() {
    this.name = null;
    this.categoryName = null;
    this.serviceName = null;
    this.totalUnits = null;
    this.totalPrice = null;
  }

  /**
   * Set course with test data
   * @returns {CourseBuilder} Builder instance
   */
  withTestData() {
    this.name = `Test Course ${uuidv4().substring(0, 8)}`;
    this.categoryName = "Cut + Styling";
    this.serviceName = "test online €10.00 10min";
    this.totalUnits = 1;
    this.totalPrice = Math.floor(Math.random() * 10) + 1;
    return this;
  }

  /**
   * Build the Course instance
   * @returns {Course} Course instance
   */
  build() {
    return new Course(
      this.name,
      this.categoryName,
      this.serviceName,
      this.totalUnits,
      this.totalPrice
    );
  }
}
