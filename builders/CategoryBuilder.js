/**
 * CategoryBuilder
 */

import { Category } from '../models/Category.js';
import { ServiceBuilder } from './ServiceBuilder.js';

export class CategoryBuilder {
  constructor() {
    this.name = null;
    this.services = [];
  }

  /**
   * Set category name
   * @param {string} name - Category name
   * @returns {CategoryBuilder} Builder instance
   */
  withName(name) {
    this.name = name;
    return this;
  }

  /**
   * Set services
   * @param {Service[]} services - Services array
   * @returns {CategoryBuilder} Builder instance
   */
  withServices(services) {
    this.services = services;
    return this;
  }

  /**
   * Set category with test data
   * @returns {CategoryBuilder} Builder instance
   */
  withTestData() {
    this.name = "Cut + Styling";
    this.services = [
      new ServiceBuilder().withName("Test online").withPrice(10.00).build()
    ];
    return this;
  }

  /**
   * Set category with test expensive data
   * @returns {CategoryBuilder} Builder instance
   */
  withTestExpensiveData() {
    this.name = "Test expensive";
    this.services = [
      new ServiceBuilder().withName("Test expensive name").withPrice(100.00).build()
    ];
    return this;
  }

  /**
   * Build the Category instance
   * @returns {Category} Category instance
   */
  build() {
    return new Category(this.name, this.services);
  }
}