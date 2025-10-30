/**
 * Category model
 */

import { Service } from './Service.js';

export class Category {
  constructor(name, services = []) {
    this.name = name;
    this.services = services;
  }

  /**
   * Add a service to this category
   * @param {Service} service - Service to add
   */
  addService(service) {
    if (!this.services.includes(service)) {
      this.services.push(service);
    }
  }

  /**
   * Remove a service from this category
   * @param {Service} service - Service to remove
   * @returns {boolean} True if removed, False if not found
   */
  removeService(service) {
    const index = this.services.indexOf(service);
    if (index > -1) {
      this.services.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculate the total price of all services in this category
   * @returns {number} Total price
   */
  getTotalPrice() {
    return this.services.reduce((total, service) => total + service.price, 0);
  }

  /**
   * Get the number of services in this category
   * @returns {number} Service count
   */
  getServiceCount() {
    return this.services.length;
  }

  /**
   * Find a service by name
   * @param {string} serviceName - Name of the service to find
   * @returns {Service|null} Service if found, null otherwise
   */
  findServiceByName(serviceName) {
    return this.services.find(service => service.name === serviceName) || null;
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `Category: ${this.name} (${this.getServiceCount()} services)`;
  }

  /**
   * Debug representation
   * @returns {string} Debug representation
   */
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `Category(name='${this.name}', services=${this.services.length} items)`;
  }
}
