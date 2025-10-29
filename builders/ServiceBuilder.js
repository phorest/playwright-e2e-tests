/**
 * ServiceBuilder - JavaScript version of builders/ServiceBuilder.py
 */

import { Service } from '../models/Service.js';

export class ServiceBuilder {
  constructor() {
    this.name = null;
    this.price = null;
  }

  /**
   * Set service name
   * @param {string} name - Service name
   * @returns {ServiceBuilder} Builder instance
   */
  withName(name) {
    this.name = name;
    return this;
  }

  /**
   * Set service price
   * @param {number} price - Service price
   * @returns {ServiceBuilder} Builder instance
   */
  withPrice(price) {
    this.price = price;
    return this;
  }

  /**
   * Set service with test data
   * @returns {ServiceBuilder} Builder instance
   */
  withTestData() {
    this.name = "Test online";
    this.price = 10.00;
    return this;
  }

  /**
   * Build the Service instance
   * @returns {Service} Service instance
   */
  build() {
    return new Service(this.name, this.price);
  }
}